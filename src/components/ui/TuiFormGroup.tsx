import React from 'react';

interface TuiFormGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function TuiFormGroup({ children, className = "" }: TuiFormGroupProps) {
    return (
        <div className={`space-y-4 p-4 border border-paper-outline/5 hover:border-paper-primary/20 transition-all duration-500 bg-card/20 relative group ${className}`}>
            {/* Minimalist drafting mark */}
            <div className="absolute top-0 left-0 w-1 h-1 bg-paper-primary/20 group-hover:bg-paper-primary/40 transition-colors" />
            {children}
        </div>
    );
}
