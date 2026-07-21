import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface AlertContextType {
  showAlert: (message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Notification');

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAlert = (msg: string, t?: string) => {
    setMessage(msg);
    setTitle(t || 'Notification');
    setIsOpen(true);
  };

  const closeAlert = () => {
    setIsOpen(false);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      
      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-[110] backdrop-blur-sm">
          <div className="bg-surface-card border border-surface-card-2 w-full max-w-sm shadow-2xl">
            <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2">
              <h3 className="text-lg font-medium tracking-tight text-ink-pure font-display">{title}</h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-sm font-mono text-gray-700 text-ink-near-white">
                {message}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-surface-card-2 flex justify-center bg-surface-card-2">
              <button 
                onClick={closeAlert}
                className="px-8 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-none transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AlertContext.Provider>
  );
};
