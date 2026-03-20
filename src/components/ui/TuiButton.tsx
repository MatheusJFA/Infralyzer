import React from 'react';

interface TuiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function TuiButton({ children, loading, className = "", ...props }: TuiButtonProps) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`w-full bg-terminal-primary text-terminal-black font-bold py-5 uppercase tracking-widest flex items-center justify-center gap-3 text-lg transition-all active:scale-[0.98] focus:ring-0 focus:outline-none shadow-[0_0_15px_rgba(0,253,0,0.4)]
        ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-terminal-primary-glow'} ${className}`}
    >
      {loading ? <span className="animate-pulse">_PROCESSING</span> : children}
    </button>
  );
}
