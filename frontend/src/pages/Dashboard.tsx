import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, FileCode, HardDrive, DownloadCloud, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axios';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full font-mono text-sm text-ink-dim">Loading dashboard...</div>;
  }

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-8">
      <div className="border-b border-surface-card-2 pb-4 mb-8">
        <h2 className="text-2xl font-medium tracking-tight text-ink-pure font-display">Overview</h2>
        <p className="text-sm text-ink-dim font-mono mt-1">System status and repository metrics</p>
      </div>
      
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 border border-surface-card-2 bg-surface-card mb-12">
        <div className="p-6 border-b md:border-b-0 md:border-r border-surface-card-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-dim">Total Files</p>
            <Database className="h-4 w-4 text-ink-dim" />
          </div>
          <h3 className="text-3xl font-medium text-ink-pure font-display">{stats?.totalFiles || 0}</h3>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-surface-card-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-dim">Storage Used</p>
            <HardDrive className="h-4 w-4 text-ink-dim" />
          </div>
          <h3 className="text-3xl font-medium text-ink-pure font-display">{formatBytes(stats?.storageUsedBytes || 0)}</h3>
        </div>

        <div className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-ink-dim">System Health</p>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="text-3xl font-medium text-ink-pure font-display flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Online
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Storage by System */}
        <div className="border border-surface-card-2 bg-surface-card">
          <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2">
            <h3 className="text-sm font-semibold tracking-wide text-ink-pure font-display uppercase">Storage by System</h3>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.storageBySystem || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="size"
                  nameKey="name"
                >
                  {(stats?.storageBySystem || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatBytes(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Trend */}
        <div className="border border-surface-card-2 bg-surface-card">
          <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2">
            <h3 className="text-sm font-semibold tracking-wide text-ink-pure font-display uppercase">Activity Trend (Last 7 Days)</h3>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.activityTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="uploads" name="Uploads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="downloads" name="Downloads" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="border border-surface-card-2 bg-surface-card">
          <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2">
            <h3 className="text-sm font-semibold tracking-wide text-ink-pure font-display uppercase">Recent Uploads</h3>
          </div>
          <ul className="divide-y divide-surface-card-2">
            {stats?.latestUploads?.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm font-mono text-ink-dim">No recent uploads</li>
            ) : (
              stats?.latestUploads?.map((item: any) => (
                <li key={item.id} className="px-6 py-4 flex items-center justify-between group hover:bg-surface-card-2 transition-colors">
                  <div className="flex items-center">
                    <FileCode className="h-4 w-4 text-ink-dim mr-4" />
                    <div>
                      <p className="text-sm font-medium text-ink-near-white">{item.files.file_name}</p>
                      <p className="text-xs font-mono text-ink-dim mt-0.5">v{item.version_number}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-ink-dim">{new Date(item.upload_date).toLocaleDateString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Downloads */}
        <div className="border border-surface-card-2 bg-surface-card">
          <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2">
            <h3 className="text-sm font-semibold tracking-wide text-ink-pure font-display uppercase">Most Downloaded</h3>
          </div>
          <ul className="divide-y divide-surface-card-2">
            {stats?.mostDownloaded?.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm font-mono text-ink-dim">No downloads yet</li>
            ) : (
              stats?.mostDownloaded?.map((item: any, idx: number) => (
                <li key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-surface-card-2 transition-colors">
                  <div className="flex items-center">
                    <DownloadCloud className="h-4 w-4 text-ink-dim mr-4" />
                    <div>
                      <p className="text-sm font-medium text-ink-near-white">{item.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-ink-dim">{item.count} DLs</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
