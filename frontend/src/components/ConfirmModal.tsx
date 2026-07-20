import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <h3 className="text-lg font-medium tracking-tight text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        <div className="p-6">
          <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/20">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors rounded-none"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
            }}
            className={`px-4 py-2 text-sm font-medium text-white transition-colors rounded-none ${
              isDestructive 
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600' 
                : 'bg-gray-900 hover:bg-black dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
