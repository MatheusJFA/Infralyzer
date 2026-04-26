import React from 'react';
import { InfoTooltip } from "@/components/InfoTooltip";

interface TuiDataBoxProps {
    label: string;
    value: React.ReactNode;
    infoText?: string;
    className?: string;
    largeValue?: boolean;
    subValue?: React.ReactNode;
}

export function TuiDataBox({ label, value, infoText, className = "", largeValue = true, subValue }: TuiDataBoxProps) {
    return (
        <div className={`w-full p-4 bg-card/30 border border-paper-outline/5 relative group hover:bg-card/50 hover:border-paper-primary/30 transition-all duration-300 hover:shadow-[0_0_20px_-5px_hsl(var(--paper-primary)/0.08)] ${className}`}>
            {/* Subtle Drafting Detail */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-paper-primary/20 group-hover:border-paper-primary/50 transition-colors duration-500" />
            
            <div className="text-[10px] text-muted-foreground tracking-wider flex items-center mb-2 select-none">
                <span className="opacity-70 font-bold uppercase">{label}</span>
                {infoText && <InfoTooltip content={infoText} />}
            </div>
            <div className="flex flex-col">
                <div className={`${largeValue ? 'text-4xl tracking-tighter' : 'text-xl tracking-wider'} font-bold text-paper-primary transition-all duration-300 group-hover:translate-x-0.5`}>
                    {value}
                </div>
                {subValue && (
                    <div className="mt-1 text-[10px] opacity-80 uppercase tracking-widest text-paper-primary font-medium">
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
}
