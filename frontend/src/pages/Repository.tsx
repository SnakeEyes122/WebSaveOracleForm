import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Upload, Download, History, MoreVertical, FileCode, Filter } from 'lucide-react';
import api from '../api/axios';
import VersionHistoryModal from './VersionHistoryModal';

interface FileData {
  id: string;
  file_name: string;
  extension: string;
  latest_version: string;
  status: string;
  updated_at: string;
  modules?: { name: string; projects?: { name: string } };
  created_by_user?: { full_name: string };
}

const Repository: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [moduleId, setModuleId] = useState('');
  const [extension, setExtension] = useState('');
  const [status, setStatus] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [historyFile, setHistoryFile] = useState<FileData | null>(null);

  const { data: files, isLoading } = useQuery<FileData[]>({
    queryKey: ['files', searchTerm, moduleId, extension, status],
    queryFn: async () => {
      const response = await api.get('/files', { params: { search: searchTerm || undefined, module_id: moduleId || undefined, extension: extension || undefined, status: status || undefined } });
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
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [systemName, setSystemName] = useState('');
  const [remark, setRemark] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { data: modules } = useQuery<any[]>({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await api.get('/modules');
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
    if (!selectedModuleId) return alert('Please select a module.');

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formData.append('module_id', selectedModuleId);
    if (systemName) formData.append('system_name', systemName);
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">File Repository</h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
            />
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="h-5 w-5" />
          </button>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Upload className="h-5 w-5" />
            <span>Upload</span>
          </button>
        </div>
      </div>
      {filtersOpen && <div className="flex gap-3 rounded-lg bg-white p-4 shadow"><select value={moduleId} onChange={e=>setModuleId(e.target.value)}><option value="">All modules</option>{modules?.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><select value={extension} onChange={e=>setExtension(e.target.value)}><option value="">All types</option><option>.fmb</option><option>.fmx</option><option>.rdf</option></select><select value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option>Active</option><option>Archived</option></select><button onClick={()=>{setModuleId('');setExtension('');setStatus('')}}>Clear</button></div>}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">File Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Project / Module</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Version</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Last Updated</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Uploaded By</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading files...</td>
                </tr>
              ) : files?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No files found.</td>
                </tr>
              ) : (
                files?.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{file.file_name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{file.extension.toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{file.modules?.projects?.name || '-'}</p>
                      <p className="text-xs text-gray-500">{file.modules?.name || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        v{file.latest_version}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(file.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Upload Oracle Forms / Reports</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Module *</label>
                <select 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                >
                  <option value="">-- Select Module --</option>
                  {modules?.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.projects?.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System Name</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  placeholder="e.g. HR, Finance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remark (Version Note)</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Describe changes in this version..."
                />
              </div>
            </div>

            <div 
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-blue-500 mx-auto mb-4" />
              <p className="text-gray-900 dark:text-white font-medium">Click to browse files</p>
              <p className="text-sm text-gray-500 mt-2">Only .fmb, .fmx, .rdf are allowed</p>
              <input 
                type="file" 
                multiple 
                accept=".fmb,.fmx,.rdf" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Files ({selectedFiles.length}):</p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {selectedFiles.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <FileCode className="h-4 w-4" /> {f.name} ({(f.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button 
                onClick={handleUploadSubmit}
                disabled={isUploading || selectedFiles.length === 0 || !selectedModuleId}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Upload Files'}
              </button>
            </div>
          </div>
        </div>
      )}
      <VersionHistoryModal open={!!historyFile} fileId={historyFile?.id || null} fileName={historyFile?.file_name || ''} onClose={() => setHistoryFile(null)} />
    </div>
  );
};

export default Repository;
