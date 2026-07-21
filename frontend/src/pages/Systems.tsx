import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';

type System = { id: string; name: string; description?: string; created_at: string };

export default function Systems() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [edit, setEdit] = useState<System | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery<System[]>({
    queryKey: ['systems'],
    queryFn: () => api.get('/systems').then(r => r.data)
  });

  const { data: subscriptions = [], refetch: refetchSubs } = useQuery<string[]>({
    queryKey: ['subscriptions'],
    queryFn: () => api.get('/notifications/subscriptions').then(r => r.data),
    enabled: !!user
  });

  const toggleSubscription = async (systemId: string) => {
    try {
      await api.post('/notifications/subscribe', { system_id: systemId });
      refetchSubs();
    } catch (err: any) {
      showAlert(err.response?.data?.error || 'Failed to toggle subscription', 'Error');
    }
  };

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
      showAlert(err.response?.data?.error || 'Failed to save system', 'Error');
    }
  };

  const del = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/systems/${deleteId}`);
      qc.invalidateQueries({ queryKey: ['systems'] });
    } catch (err: any) {
      showAlert(err.response?.data?.error || 'Failed to delete system', 'Error');
    } finally {
      setDeleteId(null);
    }
  };

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="max-w-7xl mx-auto py-8 px-8">
      <div className="border-b border-surface-card-2 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-ink-pure font-display">Systems</h2>
          <p className="text-sm text-ink-dim font-mono mt-1">Manage physical systems and applications</p>
        </div>
        {isAdmin && (
          <button 
            onClick={openAdd}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 px-4 py-2 rounded-none transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add System
          </button>
        )}
      </div>

      <div className="bg-surface-card border border-surface-card-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-card-2 bg-surface-card-2">
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Name</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Description</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Created At</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-card-2">
              {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">Loading systems...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">No systems found.</td>
                </tr>
              ) : (
                data.map((system) => (
                  <tr key={system.id} className="hover:bg-surface-card-2 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-ink-near-white">{system.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink-dim">
                      {system.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-ink-dim">
                      {new Date(system.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleSubscription(system.id)}
                          className={`p-1.5 transition-colors ${subscriptions.includes(system.id) ? 'text-blue-600 dark:text-blue-400' : 'text-ink-dim hover:text-gray-900 dark:text-ink-dim dark:hover:text-white'}`}
                          title={subscriptions.includes(system.id) ? 'Unwatch System' : 'Watch System'}
                        >
                          {subscriptions.includes(system.id) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => openEdit(system)}
                              className="p-1.5 text-ink-dim hover:text-gray-900 dark:text-ink-dim dark:hover:text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => del(system.id)}
                              className="p-1.5 text-ink-dim hover:text-red-600 dark:text-ink-dim dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
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
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">System Name *</label>
            <input 
              type="text" 
              className="w-full p-2 border border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors"
              placeholder="e.g. HR System" 
              value={name} 
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">Description</label>
            <textarea 
              className="w-full p-3 border border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors h-24"
              placeholder="Optional description" 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div className="pt-6 flex justify-end gap-3 border-t border-surface-card-2 -mx-6 px-6 pb-2">
            <button onClick={close} className="px-6 py-2 border border-surface-card-2 text-sm font-medium text-ink-near-white hover:bg-surface-card-2 rounded-none transition-colors">
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
        title="Delete System"
        message="Are you sure you want to delete this system? All files under it will also be deleted. This cannot be undone."
        confirmText="Delete System"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
