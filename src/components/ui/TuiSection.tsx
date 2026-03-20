import React from 'react';

interface TuiSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  sectionRef?: React.RefObject<HTMLElement> | any;
  variant?: 'left' | 'right';
}

export function TuiSection({ title, children, className = "", sectionRef, variant = 'left' }: TuiSectionProps) {
  return (
    <section
      ref={sectionRef}
      className={`w-full bg-terminal-neutral border border-terminal-tertiary/20 p-6 flex flex-col relative shadow-[0_0_20px_rgba(0,0,0,0.8)]
        ${className}`}
    >
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-terminal-primary"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-terminal-primary"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-terminal-primary"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-terminal-primary"></div>
      
      {title && (
        <h2 className="text-sm font-bold tracking-widest mb-6 flex items-center gap-2 uppercase">
          <span className="text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">{'>'}</span> 
          [ {title} ]
        </h2>
      )}
      {children}
    </section>
  );
}
