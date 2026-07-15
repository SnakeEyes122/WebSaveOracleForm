import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

type System = { id: string; name: string; description?: string; created_at: string };

export default function Systems() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [edit, setEdit] = useState<System | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data = [], isLoading } = useQuery<System[]>({
    queryKey: ['systems'],
    queryFn: () => api.get('/systems').then(r => r.data)
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

  const openEdit = (system: System) => {
    setEdit(system);
    setName(system.name);
    setDescription(system.description || '');
    setIsModalOpen(true);
  };

  const save = async () => {
    if (!name.trim()) return;
    try {
      if (edit?.id) {
        await api.put(`/systems/${edit.id}`, { name, description });
      } else {
        await api.post('/systems', { name, description });
      }
      qc.invalidateQueries({ queryKey: ['systems'] });
      close();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save system');
    }
  };

  const del = async (id: string) => {
    if (confirm('Are you sure you want to delete this system? All files under it will also be deleted.')) {
      try {
        await api.delete(`/systems/${id}`);
        qc.invalidateQueries({ queryKey: ['systems'] });
      } catch (err: any) {
        alert(err.response?.data?.error || 'Failed to delete system');
      }
    }
  };

  const isAdmin = user?.role === 'Admin';
  const canCreate = user?.role === 'Admin' || user?.role === 'Developer';

  return (
    <div className="max-w-7xl mx-auto py-8 px-8">
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-white">Systems</h2>
          <p className="text-sm text-gray-500 font-mono mt-1">Manage physical systems and applications</p>
        </div>
        {canCreate && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 px-4 py-2 rounded-none transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add System
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Name</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Description</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest">Created At</th>
                {isAdmin && <th className="px-6 py-3 text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-sm font-mono text-gray-500">Loading systems...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-sm font-mono text-gray-500">No systems found.</td>
                </tr>
              ) : (
                data.map((system) => (
                  <tr key={system.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{system.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {system.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                      {new Date(system.created_at).toLocaleDateString()}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEdit(system)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => del(system.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
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

      <Modal open={isModalOpen} title={edit?.id ? 'Edit System' : 'Add System'} onClose={close}>
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">System Name *</label>
            <input 
              type="text" 
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 font-mono transition-colors"
              placeholder="e.g. HR System" 
              value={name} 
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-gray-500 uppercase tracking-widest mb-2">Description</label>
            <textarea 
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-none bg-white dark:bg-[#0a0a0a] text-sm text-gray-900 dark:text-white focus:outline-none focus:border-gray-500 font-mono transition-colors h-24"
              placeholder="Optional description" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 -mx-6 px-6 pb-2">
            <button onClick={close} className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none transition-colors">
              Cancel
            </button>
            <button onClick={save} disabled={!name.trim()} className="px-6 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 disabled:opacity-50 text-sm font-medium rounded-none transition-colors">
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
