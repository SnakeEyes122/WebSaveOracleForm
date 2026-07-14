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
    return <div className="flex items-center justify-center h-full">Loading dashboard...</div>;
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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Overview</h2>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
            <Database className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Files</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalFiles || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
            <FileCode className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Forms (.fmb)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.extensions.fmb || 0}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-600 dark:text-green-400">
            <HardDrive className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Storage Used</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(stats?.storageUsedBytes || 0)}</h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-lg text-orange-600 dark:text-orange-400">
            <Activity className="h-8 w-8" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Health</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Online</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Uploads */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Uploads</h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {stats?.latestUploads?.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No recent uploads</li>
            ) : (
              stats?.latestUploads?.map((item: any) => (
                <li key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                       <FileCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.files.file_name}</p>
                      <p className="text-xs text-gray-500">v{item.version_number}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(item.upload_date).toLocaleDateString()}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Most Downloaded */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Most Downloaded</h3>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
             {stats?.mostDownloaded?.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500">No downloads yet</li>
            ) : (
              stats?.mostDownloaded?.map((item: any, idx: number) => (
                <li key={idx} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                       <DownloadCloud className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {item.count} DLs
                  </span>
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
