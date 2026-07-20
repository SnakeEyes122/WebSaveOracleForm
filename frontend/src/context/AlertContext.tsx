import React, { createContext, useContext, useState, type ReactNode } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('Notification');

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
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-[110] backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 w-full max-w-sm shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
              <h3 className="text-lg font-medium tracking-tight text-gray-900 dark:text-white">{title}</h3>
            </div>
            
            <div className="p-6 text-center">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                {message}
              </p>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-center bg-gray-50/50 dark:bg-gray-900/20">
              <button 
                onClick={closeAlert}
                className="px-8 py-2 bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-none transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};
