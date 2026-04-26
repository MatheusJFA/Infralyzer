import React from 'react';

interface TuiFormGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function TuiFormGroup({ children, className = "" }: TuiFormGroupProps) {
    return (
        <div className={`space-y-4 p-4 border border-paper-outline hover:border-paper-primary/50 transition-colors bg-card pencil-box ${className}`}>
            {children}
        </div>
    );
}
