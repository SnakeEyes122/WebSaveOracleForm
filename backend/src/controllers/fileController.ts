import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import crypto from 'crypto';
import { createAuditLog } from '../services/auditService';

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    const { module_id, system_name, remark } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (!module_id) {
      return res.status(400).json({ error: 'module_id is required' });
    }

    const uploadedFilesData = [];

    for (const file of files) {
      const original_name = file.originalname;
      const file_name = original_name; // We keep them same for now
      const extension = original_name.substring(original_name.lastIndexOf('.')).toLowerCase();
      
      // Validate extension
      if (!['.fmb', '.fmx', '.rdf'].includes(extension)) {
        throw new Error(`Invalid file extension: ${extension}. Only .fmb, .fmx, .rdf are allowed.`);
      }

      // Check if file already exists in this module
      const { data: existingFile } = await supabase
        .from('files')
        .select('*')
        .eq('module_id', module_id)
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
            module_id, 
            system_name, 
            original_name, 
            file_name, 
            extension, 
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
      const storagePath = `${module_id}/${fileId}/${newVersionNumber}_${file_name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('oracle-forms-repo')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (storageError) {
         // Rollback logic could be added here
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
    }

    res.status(201).json({ message: 'Files uploaded successfully', data: uploadedFilesData });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getFiles = async (req: Request, res: Response) => {
  try {
    const { module_id, search, extension, status } = req.query;
    
    let query = supabase.from('files').select(`
      *,
      modules (name, projects (name)),
      created_by_user:users!files_created_by_fkey (full_name)
    `).order('updated_at', { ascending: false });

    if (module_id) query = query.eq('module_id', module_id);
    if (extension) query = query.eq('extension', extension);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.ilike('file_name', `%${search}%`);
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
      
      await createAuditLog({ userId: req.user.id, action: 'Download File', entityType: 'File Version', entityId: id as string, details: { fileName: version.files.file_name, version: version.version_number } });
    }

    const buffer = await fileData.arrayBuffer();
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${version.files.file_name}"`);
    res.send(Buffer.from(buffer));
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
