import React from 'react';

interface TuiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function TuiButton({ children, loading, className = "", ...props }: TuiButtonProps) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`w-full bg-paper-primary text-card font-bold py-5 uppercase tracking-widest flex items-center justify-center gap-3 text-lg transition-all active:scale-[0.98] focus:ring-0 focus:outline-none shadow-sm
      ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-paper-primary/90'} ${className}`}
    >
      {loading ? <span className="">_PROCESSING</span> : children}
    </button>
  );
}
