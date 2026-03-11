import React from 'react';

interface TuiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function TuiButton({ children, loading, className = "", ...props }: TuiButtonProps) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`w-full bg-primary text-primary-foreground font-bold py-3 uppercase tracking-widest border-2 border-primary transition-colors focus:ring-0 focus:outline-none 
        ${loading ? 'opacity-70 cursor-wait' : 'hover:bg-transparent hover:text-primary'} ${className}`}
    >
      [ {children} ]
    </button>
  );
}
