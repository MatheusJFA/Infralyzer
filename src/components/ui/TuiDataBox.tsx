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
        <div className={`w-full p-4 bg-card border-t border-paper-outline/20 relative group hover:border-paper-primary/50 transition-colors duration-300 ${className}`}>
            <div className="text-[10px] text-muted-foreground tracking-wider flex items-center mb-2">
                <span className="opacity-80 font-bold uppercase">{label}</span>
                {infoText && <InfoTooltip content={infoText} />}
            </div>
            <div className="flex flex-col">
                <div className={`${largeValue ? 'text-4xl tracking-tighter' : 'text-xl tracking-wider'} font-bold text-paper-primary `}>
                    {value}
                </div>
                {subValue && (
                    <div className="mt-1 text-[10px] opacity-80 uppercase tracking-widest text-paper-primary">
                        {subValue}
                    </div>
                )}
            </div>
        </div>
    );
}
