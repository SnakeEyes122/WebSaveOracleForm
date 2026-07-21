import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export default function AuditLogs() {
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery<any>({
    queryKey: ['audit-logs', search, action, page],
    queryFn: () => api.get('/audit-logs', { params: { search, action, page, limit: 20 } }).then(r => r.data)
  });
  
  const totalPages = Math.max(1, Math.ceil((data?.total || 0) / (data?.limit || 20)));

  return (
    <div className="max-w-7xl mx-auto py-8 px-8">
      <div className="border-b border-surface-card-2 pb-4 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-ink-pure font-display">Audit Logs</h2>
          <p className="text-sm text-ink-dim font-mono mt-1">Review system activities and changes</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <input 
            className="w-full sm:w-64 p-1.5 border border-gray-300 border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono placeholder-gray-400 transition-colors" 
            placeholder="Search by details or user..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <input 
            className="w-full sm:w-48 p-1.5 border border-gray-300 border-surface-card-2 rounded-none bg-surface-card text-sm text-ink-pure font-display focus:outline-none focus:border-gray-500 font-mono placeholder-gray-400 transition-colors" 
            placeholder="Action (e.g. DELETE)" 
            value={action} 
            onChange={e => { setAction(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      <div className="bg-surface-card border border-surface-card-2 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-card-2 bg-surface-card-2">
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest whitespace-nowrap">Time</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">User</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Action</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Entity</th>
                <th className="px-6 py-3 text-xs font-mono font-semibold text-ink-dim uppercase tracking-widest">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-card-2">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">Loading audit logs...</td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm font-mono text-ink-dim">No logs found.</td>
                </tr>
              ) : (
                data?.data?.map((l: any) => (
                  <tr key={l.id} className="hover:bg-surface-card-2 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-ink-dim whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-sm text-ink-near-white">
                        {l.users?.full_name || l.users?.username || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-0.5 border border-surface-card-2 bg-surface-card-2 text-ink-near-white uppercase whitespace-nowrap">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-ink-dim uppercase">
                        {l.entity_type || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs text-ink-dim max-w-md truncate" title={l.details ? JSON.stringify(l.details) : ''}>
                        {l.details ? JSON.stringify(l.details) : '-'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center px-4 py-2 bg-surface-card border border-surface-card-2">
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)}
          className="px-4 py-1.5 text-sm font-mono uppercase tracking-widest text-ink-near-white hover:bg-surface-card-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="font-mono text-sm text-ink-dim">
          Page {page} of {totalPages}
        </span>
        <button 
          disabled={page === totalPages} 
          onClick={() => setPage(page + 1)}
          className="px-4 py-1.5 text-sm font-mono uppercase tracking-widest text-ink-near-white hover:bg-surface-card-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
