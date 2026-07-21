import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-lg bg-surface-card border border-surface-card-2">
        <div className="px-6 py-4 border-b border-surface-card-2 bg-surface-card-2 flex justify-between items-center">
          <h3 className="text-lg font-medium tracking-tight text-ink-pure font-display">{title}</h3>
          <button onClick={onClose} className="text-ink-dim hover:text-gray-900 dark:hover:text-white text-2xl leading-none transition-colors">&times;</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
