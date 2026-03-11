import React from 'react';

interface TuiFormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function TuiFormGroup({ children, className = "" }: TuiFormGroupProps) {
  return (
    <div className={`space-y-4 p-4 border border-primary/50 hover:border-primary rounded-none bg-black shadow-none transition-all ${className}`}>
      {children}
    </div>
  );
}
