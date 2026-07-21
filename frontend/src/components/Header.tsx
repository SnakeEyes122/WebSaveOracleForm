import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Check, Info, Sun, Moon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
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
    <header className="h-16 bg-canvas border-b border-surface-card-2 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center">
        <h1 className="text-xl font-display font-bold tracking-tight text-ink-pure">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center space-x-6 h-full">

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="text-ink-dim hover:text-ink-near-white transition-colors focus:outline-none"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-ink-dim hover:text-ink-near-white relative transition-colors focus:outline-none"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-none bg-red-600 text-[9px] font-bold text-white border border-canvas">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-surface-card border border-surface-card-2 shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-surface-card-2 flex justify-between items-center">
                <h3 className="text-sm font-medium text-ink-near-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAsRead}
                    className="text-xs font-mono text-brand-cerulean hover:underline flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm font-mono text-ink-dim">
                    No notifications yet.
                  </div>
                ) : (
                  <ul className="divide-y divide-surface-card-2">
                    {notifications.map((n) => (
                      <li key={n.id} className={`p-4 hover:bg-surface-card-2 transition-colors ${!n.is_read ? 'bg-surface-card-2/50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex-shrink-0 ${n.type === 'SecurityAlert' ? 'text-red-500' : 'text-brand-cerulean'}`}>
                            <Info className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink-near-white">{n.title}</p>
                            <p className="text-xs text-ink-dim mt-1 break-words">{n.message}</p>
                            <p className="text-[10px] font-mono text-ink-soft mt-2">
                              {new Date(n.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!n.is_read && (
                            <div className="h-2 w-2 rounded-full bg-brand-cerulean mt-1.5 flex-shrink-0"></div>
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
