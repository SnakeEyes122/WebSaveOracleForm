import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, FileCode, HardDrive, DownloadCloud, Activity } from 'lucide-react';
import api from '../api/axios';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full font-mono text-sm text-gray-500">Loading dashboard...</div>;
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
      <div className="border-b border-gray-200 dark:border-gray-800 pb-4 mb-8">
        <h2 className="text-2xl font-medium tracking-tight text-gray-900 dark:text-white">Overview</h2>
        <p className="text-sm text-gray-500 font-mono mt-1">System status and repository metrics</p>
      </div>
      
      {/* Stat Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-12">
        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500">Total Files</p>
            <Database className="h-4 w-4 text-gray-400" />
          </div>
          <h3 className="text-3xl font-medium text-gray-900 dark:text-white">{stats?.totalFiles || 0}</h3>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500">Storage Used</p>
            <HardDrive className="h-4 w-4 text-gray-400" />
          </div>
          <h3 className="text-3xl font-medium text-gray-900 dark:text-white">{formatBytes(stats?.storageUsedBytes || 0)}</h3>
        </div>

        <div className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-gray-500">System Health</p>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <h3 className="text-3xl font-medium text-gray-900 dark:text-white flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Online
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Uploads */}
        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
            <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">Recent Uploads</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {stats?.latestUploads?.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm font-mono text-gray-500">No recent uploads</li>
            ) : (
              stats?.latestUploads?.map((item: any) => (
                <li key={item.id} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center">
                    <FileCode className="h-4 w-4 text-gray-400 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.files.file_name}</p>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">v{item.version_number}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{new Date(item.upload_date).toLocaleDateString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Recent Downloads */}
        <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
            <h3 className="text-sm font-semibold tracking-wide text-gray-900 dark:text-white uppercase">Most Downloaded</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {stats?.mostDownloaded?.length === 0 ? (
              <li className="px-6 py-8 text-center text-sm font-mono text-gray-500">No downloads yet</li>
            ) : (
              stats?.mostDownloaded?.map((item: any, idx: number) => (
                <li key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <div className="flex items-center">
                    <DownloadCloud className="h-4 w-4 text-gray-400 mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{item.count} DLs</span>
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
