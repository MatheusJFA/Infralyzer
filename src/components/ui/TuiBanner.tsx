import React from 'react';

interface TuiBannerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'dashed' | 'solid';
}

export function TuiBanner({ children, className = "", variant = 'dashed' }: TuiBannerProps) {
  const borderClass = variant === 'dashed' ? 'border-dashed' : 'border-solid';

  return (
    <div className={`w-full mb-4 p-3 bg-black border border-primary ${borderClass} text-sm text-primary font-bold tracking-widest uppercase mt-4 ${className}`}>
      {children}
    </div>
  );
}
