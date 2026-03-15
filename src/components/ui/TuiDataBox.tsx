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
    <div className={`w-full p-4 bg-black border border-primary/50 hover:border-primary transition-colors ${className}`}>
      <p className="text-sm text-primary font-medium flex items-center mb-1">
        <span className="opacity-80 font-bold uppercase tracking-tight">{label}</span>
        {infoText && <InfoTooltip content={infoText} />}
      </p>
      <div className="flex flex-col">
        <p className={`${largeValue ? 'text-2xl font-black' : 'text-xl font-bold'} text-primary tracking-tighter`}>
          {value}
        </p>
        {subValue && (
          <div className="mt-1 text-xs opacity-80 uppercase tracking-widest text-primary">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}
