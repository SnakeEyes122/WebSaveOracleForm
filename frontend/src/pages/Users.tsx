import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../api/axios';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useAlert } from '../context/AlertContext';

type Role = { id: number; name: string };
type User = { id: string; username: string; full_name: string | null; is_active: boolean; created_at: string; roles?: Role | Role[] };

export default function Users() {
  const qc = useQueryClient();
  const { showAlert } = useAlert();
  const [edit, setEdit] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({ queryKey: ['users'], queryFn: () => api.get('/users').then(r => r.data) });
  const { data: roles = [] } = useQuery<Role[]>({ queryKey: ['roles'], queryFn: () => api.get('/users/roles').then(r => r.data) });

  const close = () => {
    setEdit(null);
    setUsername('');
    setFullName('');
    setPassword('');
    setRoleId('');
    setActive(true);
    setError('');
  };

  const openEdit = (u: User) => {
    const r = Array.isArray(u.roles) ? u.roles[0] : u.roles;
    setEdit(u);
    setUsername(u.username);
    setFullName(u.full_name || '');
    setPassword('');
    setRoleId(String(r?.id || ''));
    setActive(u.is_active);
  };

  const save = async () => {
    try {
      if (!fullName || !roleId || (!edit?.id && (!username || !password))) {
        setError('Please complete all required fields.');
        return;
      }
      if (password && password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (edit?.id) {
        await api.put(`/users/${edit.id}`, { full_name: fullName, role_id: Number(roleId), is_active: active, ...(password ? { password } : {}) });
      } else {
        await api.post('/users', { username, password, full_name: fullName, role_id: Number(roleId) });
      }
      qc.invalidateQueries({ queryKey: ['users'] });
      close();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Unable to save user.');
    }
  };

  const del = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/users/${deleteId}`);
      qc.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      showAlert(err.response?.data?.error || 'Failed to delete user', 'Error');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-8">
      <div className="border-b border-surface-card-2 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-ink-pure font-display">User Management</h2>
          <p className="text-sm text-ink-dim font-mono mt-1">Manage users and roles in the repository</p>
        </div>
        <button 
          onClick={() => setEdit({ id: '', username: '', full_name: '', is_active: true, created_at: '' })}
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 px-4 py-2 rounded-none transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      <div className="bg-surface-card border border-surface-card-2 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-card-2 bg-surface-card-2">
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Username</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Name</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Role</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-card-2">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">Loading users...</td>
                </tr>
              ) : (
                users.map(u => {
                  const r = Array.isArray(u.roles) ? u.roles[0] : u.roles;
                  return (
                    <tr key={u.id} className="hover:bg-surface-card-2 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-mono text-sm text-ink-near-white">{u.username}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 text-ink-near-white">{u.full_name || '-'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-ink-dim border border-surface-card-2 px-2 py-0.5 uppercase">
                          {r?.name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono text-xs px-2 py-0.5 border uppercase ${u.is_active ? 'border-green-300 text-green-700 dark:border-green-800 dark:text-green-400' : 'border-gray-300 text-ink-dim'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(u)} className="p-1.5 text-ink-dim hover:text-gray-900 dark:text-ink-dim dark:hover:text-white transition-colors" title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => del(u.id)} className="p-1.5 text-ink-dim hover:text-red-600 dark:text-ink-dim dark:hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!edit} title={edit?.id ? 'Edit User' : 'Add User'} onClose={close}>
        <div className="space-y-6 mt-4">
          {error && (
            <div className="p-3 border border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 text-sm font-mono">
              {error}
            </div>
          )}
          
          {!edit?.id && (
            <div>
              <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">Username *</label>
              <input 
                className="w-full p-2 border border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">Full Name *</label>
            <input 
              className="w-full p-2 border border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 transition-colors" 
              placeholder="Full name" 
              value={fullName} 
              onChange={e => setFullName(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">Role *</label>
            <select 
              className="w-full p-2 border border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors" 
              value={roleId} 
              onChange={e => setRoleId(e.target.value)}
            >
              <option value="">Select role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest mb-2">{edit?.id ? 'New Password (Optional)' : 'Password *'}</label>
            <input 
              className="w-full p-2 border border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono transition-colors" 
              type="password" 
              placeholder={edit?.id ? 'Leave blank to keep unchanged' : 'Password'} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {edit?.id && (
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="user-active"
                className="w-4 h-4 rounded-none border-gray-300 text-gray-900 focus:ring-gray-900 border-surface-card-2 dark:bg-[#0a0a0a] dark:checked:bg-white"
                checked={active} 
                onChange={e => setActive(e.target.checked)} 
              />
              <label htmlFor="user-active" className="text-sm text-ink-near-white font-medium">Active Account</label>
            </div>
          )}
          
          <div className="pt-6 flex justify-end gap-3 border-t border-surface-card-2 -mx-6 px-6 pb-2">
            <button onClick={close} className="px-6 py-2 border border-surface-card-2 text-sm font-medium text-ink-near-white hover:bg-surface-card-2 rounded-none transition-colors">
              Cancel
            </button>
            <button onClick={save} className="px-6 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-none transition-colors">
              Save
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
