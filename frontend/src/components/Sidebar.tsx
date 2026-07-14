import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileArchive, Users, FolderTree, FileSpreadsheet, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/repository', icon: FileArchive, label: 'File Repository', roles: ['Admin', 'Developer', 'Viewer'] },
    { to: '/projects', icon: FolderTree, label: 'Projects', roles: ['Admin', 'Developer'] },
    { to: '/modules', icon: FileSpreadsheet, label: 'Modules', roles: ['Admin', 'Developer'] },
    { to: '/users', icon: Users, label: 'User Management', roles: ['Admin'] },
    { to: '/audit-logs', icon: Activity, label: 'Audit Logs', roles: ['Admin'] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed">
      <div className="h-16 flex items-center px-6 bg-gray-950 border-b border-gray-800">
        <DatabaseIcon />
        <span className="ml-3 font-bold text-lg tracking-wide">Forms Repo</span>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 bg-gray-950 border-t border-gray-800">
        <div className="flex items-center mb-4 px-2">
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.fullName}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
};

const DatabaseIcon = () => (
  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

export default Sidebar;
