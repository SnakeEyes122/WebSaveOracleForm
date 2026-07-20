import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Upload, Download, History, MoreVertical, FileCode, Filter, Trash2 } from 'lucide-react';
import api from '../api/axios';
import VersionHistoryModal from './VersionHistoryModal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';

interface FileData {
  id: string;
  file_name: string;
  latest_version: string;
  status: string;
  updated_at: string;
  systems?: { name: string };
  file_types?: { name: string };
  created_by_user?: { full_name: string };
}

const Repository: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [systemId, setSystemId] = useState('');
  const [fileTypeId, setFileTypeId] = useState('');
  const [status, setStatus] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [historyFile, setHistoryFile] = useState<FileData | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = (fileId: string) => {
    setDeleteId(fileId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/files/${deleteId}`);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete file.');
    } finally {
      setDeleteId(null);
    }
  };

  const { data: files, isLoading } = useQuery<FileData[]>({
    queryKey: ['files', searchTerm, systemId, fileTypeId, status],
    queryFn: async () => {
      const response = await api.get('/files', { params: { search: searchTerm || undefined, system_id: systemId || undefined, file_type_id: fileTypeId || undefined, status: status || undefined } });
      return response.data;
    },
  });

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      // 1. Fetch versions to get the latest file_version_id
      const versionsRes = await api.get(`/files/${fileId}/versions`);
      const versions = versionsRes.data;
      if (!versions || versions.length === 0) {
        return alert("No versions found for this file.");
      }
      const latestVersionId = versions[0].id;

      // 2. Trigger file download
      const response = await api.get(`/files/download/${latestVersionId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to download file.");
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState('');
  const [remark, setRemark] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: systems } = useQuery<any[]>({
    queryKey: ['systems'],
    queryFn: async () => {
      const response = await api.get('/systems');
      return response.data;
    },
  });

  const { data: fileTypes } = useQuery<any[]>({
    queryKey: ['file-types'],
    queryFn: async () => {
      const response = await api.get('/file-types');
      return response.data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return alert('Please select files to upload.');
    if (!selectedSystemId) return alert('Please select a system.');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('system_id', selectedSystemId);
    if (remark) formData.append('remark', remark);

    try {
      setIsUploading(true);
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Files uploaded successfully!');
      setIsUploadModalOpen(false);
      setSelectedFiles([]);
      queryClient.invalidateQueries({ queryKey: ['files'] });
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-8">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-white">File Repository</h2>
          <p className="text-sm text-gray-500 font-mono mt-1">Manage and track Oracle Forms files</p>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 font-mono placeholder-gray-400 transition-colors"
            />
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="p-1.5 border border-gray-300 dark:border-gray-700 rounded-none text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
            <Filter className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 rounded-none text-sm font-medium transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </button>
        </div>
      </div>
      
      {filtersOpen && (
        <div className="flex gap-4 p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8">
          <select className="border border-gray-300 dark:border-gray-700 rounded-none bg-transparent dark:text-white text-sm py-1.5 px-3 font-mono focus:outline-none focus:border-gray-500" value={systemId} onChange={e=>setSystemId(e.target.value)}>
            <option value="">All systems</option>
            {systems?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="border border-gray-300 dark:border-gray-700 rounded-none bg-transparent dark:text-white text-sm py-1.5 px-3 font-mono focus:outline-none focus:border-gray-500" value={fileTypeId} onChange={e=>setFileTypeId(e.target.value)}>
            <option value="">All types</option>
            {fileTypes?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="border border-gray-300 dark:border-gray-700 rounded-none bg-transparent dark:text-white text-sm py-1.5 px-3 font-mono focus:outline-none focus:border-gray-500" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option>Active</option>
            <option>Archived</option>
          </select>
          <button onClick={()=>{setSystemId('');setFileTypeId('');setStatus('')}} className="px-4 py-1.5 text-sm font-mono uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">Clear</button>
        </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">File Name</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">System</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Version</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Last Updated</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Uploaded By</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-mono text-gray-500">Loading files...</td>
                </tr>
              ) : files?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-mono text-gray-500">No files found.</td>
                </tr>
              ) : (
                files?.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <FileCode className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{file.file_name}</p>
                          <p className="text-xs font-mono text-gray-500 mt-0.5">{file.file_types?.name?.toUpperCase() || 'UNKNOWN'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-gray-300">{file.systems?.name || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 border border-gray-300 dark:border-gray-700 text-xs font-mono text-gray-700 dark:text-gray-300 bg-transparent">
                        v{file.latest_version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {new Date(file.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {file.created_by_user?.full_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleDownload(file.id, file.file_name)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                          title="Download Latest"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button onClick={() => setHistoryFile(file)} className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors" title="Version History">
                          <History className="h-5 w-5" />
                        </button>
                        {user?.role === 'Admin' && (
                          <button 
                            onClick={() => handleDelete(file.id)} 
                            className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors" 
                            title="Delete File"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 w-full max-w-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
              <h3 className="text-lg font-medium tracking-tight text-gray-900 dark:text-white">Upload Oracle Forms / Reports</h3>
            </div>
            
            <div className="p-6">
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">Target System *</label>
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-none dark:bg-[#0a0a0a] dark:text-white font-mono text-sm focus:outline-none focus:border-gray-500 transition-colors"
                    value={selectedSystemId}
                    onChange={(e) => setSelectedSystemId(e.target.value)}
                  >
                    <option value="">-- Select System --</option>
                    {systems?.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">Remark (Version Note)</label>
                  <textarea 
                    className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-none dark:bg-[#0a0a0a] dark:text-white font-mono text-sm focus:outline-none focus:border-gray-500 transition-colors"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Describe changes in this version..."
                    rows={3}
                  />
                </div>
              </div>

              <div 
                className="border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 mx-auto mb-4 transition-colors" />
                <p className="text-gray-900 dark:text-white font-medium text-sm">Click to browse files</p>
                <p className="text-xs font-mono text-gray-500 mt-2">Only allowed file types can be uploaded</p>
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-6 p-4 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20">
                  <p className="text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-3">Selected Files ({selectedFiles.length})</p>
                  <ul className="text-sm font-mono text-gray-600 dark:text-gray-400 space-y-2 max-h-48 overflow-y-auto pr-2">
                    {selectedFiles.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <FileCode className="h-4 w-4 text-gray-400 flex-shrink-0" /> 
                        <span className="text-gray-900 dark:text-gray-100 truncate">{f.name}</span>
                        <span className="text-gray-400 flex-shrink-0">({(f.size / 1024).toFixed(1)} KB)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/20">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={isUploading || selectedFiles.length === 0 || !selectedSystemId}
                className="px-6 py-2 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-medium hover:bg-black dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>
        </div>
      )}
      <VersionHistoryModal open={!!historyFile} fileId={historyFile?.id || null} fileName={historyFile?.file_name || ''} onClose={() => setHistoryFile(null)} />
      
      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete File"
        message="Are you sure you want to delete this file completely? This cannot be undone."
        confirmText="Delete File"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Repository;
