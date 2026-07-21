import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 dark:bg-black/80 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-surface-card border border-surface-card-2 w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2">
          <h3 className="text-lg font-medium tracking-tight text-ink-pure font-display">{title}</h3>
        </div>
        
        <div className="p-6">
          <p className="text-sm font-mono text-ink-dim dark:text-ink-dim">
            {message}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-surface-card-2 flex justify-end gap-3 bg-surface-card-2">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 border-surface-card-2 text-sm font-medium text-gray-700 text-ink-near-white hover:bg-white dark:hover:bg-gray-800 transition-colors rounded-none"
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
    </div>,
    document.body
  );
};

export default ConfirmModal;
