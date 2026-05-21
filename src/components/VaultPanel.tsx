import React from 'react';
import { cn } from '../lib/utils';
import { X } from 'lucide-react';

interface VaultPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const VaultPanel: React.FC<VaultPanelProps> = ({ isOpen, onClose, children }) => {
  return (
    <div 
      className={cn(
        "fixed inset-y-0 right-0 w-[400px] bg-zinc-950 border-l border-zinc-900 shadow-2xl z-50 transform transition-none duration-0",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex justify-between items-center p-4 border-b border-zinc-900">
        <h2 className="text-micro font-mono font-bold text-zinc-500 uppercase tracking-[0.3em]">
          الخزنة_الاستقصائية // VAULT_SYSTEM
        </h2>
        <button 
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300"
        >
          <X size={16} />
        </button>
      </div>
      <div className="p-6 h-[calc(100vh-60px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
