import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, Check, Info } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: !!user,
    refetchInterval: 30000 // Poll every 30 seconds
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.post('/notifications/read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
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
    <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-8 sticky top-0 z-50">
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
        
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white relative transition-colors focus:outline-none"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-none bg-red-600 text-[9px] font-bold text-white border border-white dark:border-[#0a0a0a]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAsRead}
                    className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-mono text-gray-500">
                    No notifications yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {notifications.map((n) => (
                      <li key={n.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${!n.is_read ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex-shrink-0 ${n.type === 'SecurityAlert' ? 'text-red-500' : 'text-blue-500'}`}>
                            <Info className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{n.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 break-words">{n.message}</p>
                            <p className="text-[10px] font-mono text-gray-400 mt-2">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
