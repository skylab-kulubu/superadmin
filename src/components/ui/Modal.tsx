'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-lacivert bg-opacity-50" onClick={onClose} />
      <div className="relative bg-lacivert rounded-lg shadow-xl max-w-md w-full mx-4 z-10 border border-pembe-200">
        <div className="flex items-center justify-between p-6 border-b border-pembe-200">
          <h2 className="text-xl font-bold text-yesil">{title}</h2>
          <button
            onClick={onClose}
            className="text-pembe opacity-60 hover:opacity-100 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-6 text-pembe">
          {children}
        </div>
      </div>
    </div>
  );
}

