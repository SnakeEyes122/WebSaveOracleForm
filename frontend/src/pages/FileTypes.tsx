import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

type FileType = { id: string; name: string; description?: string; created_at: string };

export default function FileTypes() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [edit, setEdit] = useState<FileType | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery<FileType[]>({
    queryKey: ['file-types'],
    queryFn: () => api.get('/file-types').then(r => r.data)
  });

  const close = () => {
    setIsModalOpen(false);
    setEdit(null);
    setName('');
    setDescription('');
  };

  const openAdd = () => {
    setEdit(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEdit = (type: FileType) => {
    setEdit(type);
    setName(type.name);
    setDescription(type.description || '');
    setIsModalOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    try {
      if (edit?.id) {
        await api.put(`/file-types/${edit.id}`, { name, description });
      } else {
        await api.post('/file-types', { name, description });
      }
      qc.invalidateQueries({ queryKey: ['file-types'] });
      close();
    } catch (err: any) {
      showAlert(err.response?.data?.error || 'Failed to save file type', 'Error');
    }
  };

  const del = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/file-types/${deleteId}`);
      qc.invalidateQueries({ queryKey: ['file-types'] });
    } catch (err: any) {
      showAlert(err.response?.data?.error || 'Failed to delete file type', 'Error');
    } finally {
      setDeleteId(null);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="max-w-7xl mx-auto py-8 px-8">
      <div className="border-b border-surface-card-2 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-ink-pure font-display">File Types</h2>
          <p className="text-sm text-ink-dim font-mono mt-1">Manage allowed file extensions (e.g., fmx, fmb, rdf)</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 px-4 py-2 rounded-none transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add File Type
          </button>
        )}
      </div>

      <div className="bg-surface-card border border-surface-card-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-card-2 bg-surface-card-2">
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Extension</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Description</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Created At</th>
                {isAdmin && <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-card-2">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">Loading file types...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">No file types found.</td>
                </tr>
              ) : (
                data.map((type) => (
                  <tr key={type.id} className="hover:bg-surface-card-2 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-ink-near-white border border-gray-300 border-surface-card-2 px-2 py-0.5 uppercase">
                        {type.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-dim dark:text-ink-dim">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-ink-dim">
                      {new Date(type.created_at).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(type)}
                            className="p-1.5 text-ink-dim hover:text-gray-900 dark:text-ink-dim dark:hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => del(type.id)}
                            className="p-1.5 text-ink-dim hover:text-red-600 dark:text-ink-dim dark:hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={isModalOpen} title={edit?.id ? 'Edit File Type' : 'Add File Type'} onClose={close}>
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">File Extension *</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors"
              placeholder="e.g. fmx, pdf" 
              value={name} 
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">Description</label>
            <textarea 
              className="w-full p-3 border border-gray-300 border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors h-24"
              placeholder="e.g. Oracle Forms Executable" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-surface-card-2 -mx-6 px-6 pb-2">
            <button onClick={close} className="px-6 py-2 border border-gray-300 border-surface-card-2 text-sm font-medium text-gray-700 text-ink-near-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors">
              Cancel
            </button>
            <button onClick={save} disabled={!name.trim()} className="px-6 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 disabled:opacity-50 text-sm font-medium rounded-none transition-colors">
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete File Type"
        message="Are you sure you want to delete this file type?"
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
