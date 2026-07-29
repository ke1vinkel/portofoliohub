import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-stone-700">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-stone-950 placeholder:text-stone-400 transition duration-200 focus:outline-none focus:ring-4 focus:ring-stone-200 ${
          error ? 'border-rose-400' : 'border-stone-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  );
};