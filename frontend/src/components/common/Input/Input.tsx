import type { InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  label?: string;
  error?: string;
}

export function Input({ icon, label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-[#a0a0b0]">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b7b]">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-[#1a1a2e] border border-[#3a3a5a] rounded-lg text-white placeholder-[#6b6b7b]
            focus:border-[#00d9ff] focus:shadow-[0_0_15px_rgba(0,217,255,0.3)] outline-none
            transition-all duration-200
            ${icon ? 'pl-10 pr-4 py-2.5' : 'px-4 py-2.5'}
            ${error ? 'border-[#ff4444]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#ff4444]">{error}</span>}
    </div>
  );
}
