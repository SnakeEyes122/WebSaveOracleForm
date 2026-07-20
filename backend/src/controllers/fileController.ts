import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import crypto from 'crypto';
import { createAuditLog } from '../services/auditService';
import { notifySubscribers, notifyAdmins } from '../services/notificationService';

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { system_id, remark } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!system_id) {
      return res.status(400).json({ error: 'system_id is required' });
    }

    const uploadedFilesData = [];

    // Fetch system data for storage path
    const { data: systemData, error: systemError } = await supabase
      .from('systems')
      .select('name')
      .eq('id', system_id)
      .single();
      
    if (systemError || !systemData) {
      return res.status(400).json({ error: 'Invalid system_id' });
    }
    
    // Sanitize names for folder paths (replace slashes with dash, spaces with underscore)
    const sanitizeName = (name: string) => name.replace(/[\/\\]/g, '-').replace(/\s+/g, '_');
    const systemName = sanitizeName(systemData.name);

    // Get allowed file types mapping
    const { data: fileTypesData, error: fileTypesError } = await supabase
      .from('file_types')
      .select('id, name');
      
    if (fileTypesError || !fileTypesData) {
      return res.status(500).json({ error: 'Failed to fetch file types' });
    }
    const fileTypesMap = new Map(fileTypesData.map(ft => [ft.name.toLowerCase(), ft.id]));

    for (const file of files) {
      // Fix multer encoding issue for Thai characters (latin1 -> utf8)
      const original_name = Buffer.from(file.originalname, 'latin1').toString('utf8');
      const file_name = original_name.replace(/[^a-zA-Z0-9.\-_\u0E00-\u0E7F]/g, '_'); // Allow Thai characters
      
      const extParts = original_name.split('.');
      if (extParts.length < 2) {
        throw new Error(`Invalid file: ${original_name}. No extension found.`);
      }
      
      const extName = extParts.pop()?.toLowerCase() || '';

      // Validate extension dynamically against file_types
      if (!fileTypesMap.has(extName)) {
        throw new Error(`Invalid file extension: .${extName}. Type not allowed in system.`);
      }
      
      // Optional: Prevent double extensions for security (e.g., .php.fmx)
      if (extParts.length > 1 && fileTypesMap.has(extParts[extParts.length - 1].toLowerCase())) {
         // Just a warning or strict check: here we let it pass but we only trust the final extension.
      }
      
      const file_type_id = fileTypesMap.get(extName);

      // Check if file already exists in this system and type
      const { data: existingFile } = await supabase
        .from('files')
        .select('*')
        .eq('system_id', system_id)
        .eq('file_type_id', file_type_id)
        .eq('file_name', file_name)
        .single();

      let fileId;
      let newVersionNumber = '1.0';

      if (existingFile) {
        fileId = existingFile.id;
        // Minor version increment logic: 1.0 -> 1.1
        const currentVersionParts = existingFile.latest_version.split('.');
        const major = parseInt(currentVersionParts[0]);
        const minor = parseInt(currentVersionParts[1]);
        newVersionNumber = `${major}.${minor + 1}`;
        
        // Update master file latest_version
        await supabase.from('files').update({ latest_version: newVersionNumber, status: 'Active' }).eq('id', fileId);
      } else {
        // Create new master file
        const { data: newFile, error: newFileError } = await supabase
          .from('files')
          .insert([{ 
            system_id, 
            file_type_id,
            original_name, 
            file_name, 
            latest_version: newVersionNumber,
            created_by: req.user?.id
          }])
          .select()
          .single();
          
        if (newFileError) throw newFileError;
        fileId = newFile.id;
      }

      // Calculate SHA256
      const checksum_sha256 = crypto.createHash('sha256').update(file.buffer).digest('hex');

      // Upload to Supabase Storage
      const fileTypeDir = extName;
      const physicalFileName = `${crypto.randomUUID()}.${extName}`;
      const storagePath = `${systemName}/${fileTypeDir}/${physicalFileName}`;
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from('oracle-forms-repo')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (storageError) {
         throw storageError;
      }

      // Create file version record
      const { data: fileVersion, error: versionError } = await supabase
        .from('file_versions')
        .insert([{
          file_id: fileId,
          version_number: newVersionNumber,
          storage_path: storagePath,
          bucket_name: 'oracle-forms-repo',
          file_size: file.size,
          checksum_sha256,
          upload_by: req.user?.id,
          remark
        }])
        .select()
        .single();
        
      if (versionError) throw versionError;

      uploadedFilesData.push(fileVersion);
      
      if (req.user) {
        await createAuditLog({ userId: req.user.id, action: 'Upload File', entityType: 'File', entityId: fileId, details: { version: newVersionNumber, fileName: file_name } });
      }

      // Notify users subscribed to this system
      notifySubscribers(
        system_id, 
        `New File Upload: ${file_name}`, 
        `Version ${newVersionNumber} of ${file_name} was uploaded to ${systemName}. Remark: ${remark || 'None'}`,
        req.user?.id
      );
    }

    res.status(201).json({ message: 'Files uploaded successfully', data: uploadedFilesData });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { system_id, file_type_id, search, status } = req.query;
    
    let query = supabase.from('files').select(`
      *,
      systems (name),
      file_types (name),
      created_by_user:users!files_created_by_fkey (full_name)
    `).order('updated_at', { ascending: false });

    if (system_id) query = query.eq('system_id', system_id);
    if (file_type_id) query = query.eq('file_type_id', file_type_id);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`file_name.ilike.%${search}%,original_name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFileVersions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // file_id
    const { data, error } = await supabase
      .from('file_versions')
      .select('*, upload_by_user:users!file_versions_upload_by_fkey (full_name)')
      .eq('file_id', id)
      .order('version_number', { ascending: false });
      
    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // file_version_id
    
    // Get version details
    const { data: version, error: versionError } = await supabase
      .from('file_versions')
      .select('*, files(file_name)')
      .eq('id', id)
      .single();
      
    if (versionError || !version) throw new Error('File version not found');

    // Download from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(version.bucket_name)
      .download(version.storage_path);

    if (downloadError) throw downloadError;

    // Log download history
    if (req.user) {
      await supabase.from('download_history').insert([{
        file_version_id: id,
        user_id: req.user.id,
        ip_address: req.ip
      }]);
      
      const fileDataRecord = version.files as any;
      await createAuditLog({ userId: req.user.id, action: 'Download File', entityType: 'File Version', entityId: id as string, details: { fileName: fileDataRecord.file_name, version: version.version_number } });
    }

    const buffer = await fileData.arrayBuffer();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${(version.files as any).file_name}"`);
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Admin only operations
export const updateFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // usually just status updates like Archived

    const { data, error } = await supabase
      .from('files')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Deleting the master file record will cascade delete file_versions.
    // However, it won't delete the physical files from Supabase Storage automatically.
    // In a production app, we should delete the physical files too.
    const { data: versions } = await supabase.from('file_versions').select('storage_path, bucket_name').eq('file_id', id);
    
    if (versions && versions.length > 0) {
        for (const version of versions) {
            await supabase.storage.from(version.bucket_name).remove([version.storage_path]);
        }
    }

    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    notifyAdmins('File Deleted', `File ID ${id} was deleted by ${req.user?.username || 'Unknown User'}`);
    
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
