import { type ReactNode } from 'react';
export default function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"><div role="dialog" aria-modal="true" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"><div className="mb-4 flex justify-between"><h3 className="text-lg font-bold">{title}</h3><button onClick={onClose}>×</button></div>{children}</div></div>;
}
