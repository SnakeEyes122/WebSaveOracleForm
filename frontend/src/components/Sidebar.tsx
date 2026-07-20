import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileArchive, Users, FolderTree, FileSpreadsheet, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/repository', icon: FileArchive, label: 'File Repository', roles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/systems', icon: FolderTree, label: 'Systems', roles: ['Admin', 'Developer'] },
    { to: '/file-types', icon: FileSpreadsheet, label: 'File Types', roles: ['Admin', 'Developer'] },
    { to: '/users', icon: Users, label: 'User Management', roles: ['Admin'] },
    { to: '/audit-logs', icon: Activity, label: 'Audit Logs', roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed z-20">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <DatabaseIcon />
        <span className="ml-3 font-semibold text-sm tracking-widest uppercase text-gray-900 dark:text-gray-100">Forms Repo</span>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="flex flex-col">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-2 ${
                  isActive 
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400' 
                    : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center mb-6">
          <div className="h-8 w-8 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-mono text-xs text-gray-600 dark:text-gray-300">
            {user?.username.substring(0, 2).toUpperCase()}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user?.fullName}</p>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-500 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-center px-4 py-2 text-xs font-mono uppercase tracking-widest text-gray-600 border border-gray-200 rounded-none hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Sign out
        </button>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={() => {
          setIsLogoutModalOpen(false);
          logout();
        }}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
      />
    </div>
  );
};

const DatabaseIcon = () => (
  <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

export default Sidebar;
