import React, { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { X } from 'lucide-react';

// Button Component
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ className = '', variant = 'primary', size = 'md', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0B] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#5E6AD2] text-white hover:bg-[#4b55be] focus:ring-[#5E6AD2]",
    secondary: "bg-[#1C1C1F] text-[#FAFAFA] hover:bg-[#232328] border border-white/10",
    ghost: "bg-transparent text-[#A1A1A6] hover:text-[#FAFAFA] hover:bg-[#1C1C1F]",
    danger: "bg-transparent text-red-500 hover:bg-red-500/10",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
};

// Input Component
export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => {
  return (
    <input 
      className={`w-full bg-[#141416] border border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#4A4A4F] focus:outline-none focus:border-[#5E6AD2] transition-colors ${className}`}
      {...props}
    />
  );
};

// Textarea Component
export const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => {
  return (
    <textarea 
      className={`w-full bg-[#141416] border border-[#2A2A30] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder-[#4A4A4F] focus:outline-none focus:border-[#5E6AD2] transition-colors min-h-[80px] resize-y ${className}`}
      {...props}
    />
  );
};

// Label Component
export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; className?: string }> = ({ children, htmlFor, className = '' }) => {
  return (
    <label htmlFor={htmlFor} className={`block text-xs font-medium text-[#A1A1A6] mb-1.5 uppercase tracking-wide ${className}`}>
      {children}
    </label>
  );
};

// Card Component
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#141416] border border-[#2A2A30] rounded-xl p-4 ${className}`}>
      {children}
    </div>
  );
};

// Badge Component
export const Badge: React.FC<{ children: React.ReactNode; color?: string; className?: string }> = ({ children, color = '#5E6AD2', className = '' }) => {
  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${className}`}
      style={{ backgroundColor: `${color}20`, color: color }}
    >
      {children}
    </span>
  );
};

// ProgressBar
export const ProgressBar: React.FC<{ current: number; total: number; color?: string }> = ({ current, total, color = '#5E6AD2' }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  return (
    <div className="h-1.5 w-full bg-[#1C1C1F] rounded-full overflow-hidden">
      <div 
        className="h-full transition-all duration-300 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
};

// Modal Component
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A0A0B] border border-[#2A2A30] rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#2A2A30]">
            <h3 className="text-lg font-bold text-[#FAFAFA]">{title}</h3>
            <button onClick={onClose} className="text-[#A1A1A6] hover:text-[#FAFAFA] transition-colors">
              <X size={20} />
            </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};