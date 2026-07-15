import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/repository') return 'File Repository';
    if (path === '/systems') return 'Systems';
    if (path === '/file-types') return 'File Types';
    if (path === '/users') return 'User Management';
    if (path === '/audit-logs') return 'Audit Logs';
    return 'Oracle Forms Repo';
  };

  return (
    <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center">
        <h1 className="text-xl font-medium tracking-tight text-gray-900 dark:text-white">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center space-x-6 h-full">
        <div className="relative h-full flex items-center border-l border-r border-gray-200 dark:border-gray-800 px-4">
          <Search className="h-4 w-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search repository..." 
            className="py-1.5 bg-transparent border-none text-sm focus:outline-none focus:ring-0 text-gray-900 dark:text-white w-64 placeholder-gray-400 font-mono"
          />
        </div>
        <button className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white relative transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 block h-2 w-2 rounded-sm bg-blue-600 ring-2 ring-white dark:ring-[#0a0a0a]"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
