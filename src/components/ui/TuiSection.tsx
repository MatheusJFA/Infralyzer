import React from 'react';

interface TuiSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  sectionRef?: React.RefObject<HTMLElement> | any;
  variant?: 'left' | 'right';
}

export function TuiSection({ title, children, className = "", sectionRef, variant = 'left' }: TuiSectionProps) {
  const cornerClasses = variant === 'left' 
    ? "before:top-0 before:left-0 before:border-t-4 before:border-l-4 after:bottom-0 after:right-0 after:border-b-4 after:border-r-4"
    : "before:top-0 before:right-0 before:border-t-4 before:border-r-4 after:bottom-0 after:left-0 after:border-b-4 after:border-l-4";

  return (
    <section
      ref={sectionRef}
      className={`w-full bg-black border-2 border-primary p-6 flex flex-col relative 
        before:content-[''] before:absolute before:w-4 before:h-4 before:border-primary 
        after:content-[''] after:absolute after:w-4 after:h-4 after:border-primary 
        ${cornerClasses} ${className}`}
    >
      {title && (
        <h2 className="text-2xl font-bold mb-6 bg-primary text-primary-foreground self-start px-2 py-1 uppercase tracking-widest leading-none">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
