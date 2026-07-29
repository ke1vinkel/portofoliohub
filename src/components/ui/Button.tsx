import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.01em] transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 active:translate-y-px disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-stone-950 text-white shadow-[0_16px_30px_-18px_rgba(28,25,23,0.7)] hover:-translate-y-0.5 hover:bg-stone-800',
    secondary: 'border border-stone-200 bg-white text-stone-800 hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-50',
    danger: 'bg-[#6f2e24] text-white shadow-[0_16px_30px_-18px_rgba(111,46,36,0.6)] hover:-translate-y-0.5 hover:bg-[#5e261f]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};