import React from 'react';
import { InfoTooltip } from "@/components/InfoTooltip";

interface TuiDataBoxProps {
  label: string;
  value: string | number;
  infoText?: string;
  className?: string;
  largeValue?: boolean;
  subValue?: React.ReactNode;
}

export function TuiDataBox({ label, value, infoText, className = "", largeValue = true, subValue }: TuiDataBoxProps) {
  return (
    <div className={`w-full p-4 bg-terminal-black border-t border-terminal-tertiary/20 relative group hover:border-terminal-primary/50 transition-colors duration-300 ${className}`}>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-terminal-primary"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-terminal-primary"></div>
      <p className="text-[10px] text-muted-foreground tracking-widest flex items-center mb-2">
        <span className="opacity-80 font-bold uppercase">{label}</span>
        {infoText && <InfoTooltip content={infoText} />}
      </p>
      <div className="flex flex-col">
        <p className={`${largeValue ? 'text-4xl tracking-tighter' : 'text-xl tracking-wider'} font-bold text-terminal-primary drop-shadow-[0_0_8px_rgba(0,255,0,0.6)]`}>
          {value}
        </p>
        {subValue && (
          <div className="mt-1 text-[10px] opacity-80 uppercase tracking-widest text-terminal-primary">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
