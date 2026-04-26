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
      className={`w-full blueprint-card p-4 sm:p-6 flex flex-col relative group transition-all duration-300 ${className}`}
    >
      {/* Drafting Corner Markers (Overhanging) */}
      <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-paper-primary/30 group-hover:border-paper-primary/60 transition-all duration-500" />
      <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t border-r border-paper-primary/30 group-hover:border-paper-primary/60 transition-all duration-500" />
      <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b border-l border-paper-primary/30 group-hover:border-paper-primary/60 transition-all duration-500" />
      <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-paper-primary/30 group-hover:border-paper-primary/60 transition-all duration-500" />

      {title && (
        <h2 className="text-sm font-bold tracking-[0.2em] mb-6 flex items-center gap-2 uppercase select-none">
          <span className="text-paper-primary opacity-40">{'>'}</span>
          <span className="text-paper-primary/70">[ {title} ]</span>
        </h2>
      )}
      
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </section>
  );
}
