import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-[#00d9ff] to-[#00ff88] text-black font-semibold hover:shadow-[0_0_20px_rgba(0,217,255,0.5)] hover:opacity-90',
  secondary: 'bg-[#252540] text-white border border-[#3a3a5a] hover:border-[#00d9ff] hover:text-[#00d9ff]',
  ghost: 'bg-transparent text-[#a0a0b0] hover:text-white hover:bg-[#252540]',
  danger: 'bg-gradient-to-r from-[#ff4444] to-[#ff6b6b] text-white font-semibold hover:shadow-[0_0_20px_rgba(255,68,68,0.4)]',
  outline: 'bg-transparent border border-[#00d9ff] text-[#00d9ff] hover:bg-[#00d9ff]/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center gap-2
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
