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
      className={`w-full bg-background border border-paper-outline/30 p-6 flex flex-col relative transition-all duration-300 hover:border-paper-primary/20
      ${className}`}
    >
      {title && (
        <h2 className="text-sm font-bold tracking-[0.2em] mb-6 flex items-center gap-2 uppercase">
          <span className="text-paper-primary opacity-50">{'>'}</span> 
          <span className="text-paper-primary/80">[ {title} ]</span>
        </h2>
      )}
      {children}
    </section>
  );
}
