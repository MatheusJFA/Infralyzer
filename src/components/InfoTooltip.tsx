import React from 'react';
import { HelpCircle } from 'lucide-react';

export function InfoTooltip({ content }: { content: string }) {
  return (
    <div className="group relative inline-flex items-center ml-1.5 align-middle cursor-help">
      <HelpCircle className="h-4 w-4 text-primary opacity-80 hover:opacity-100 hover:scale-110 drop-shadow-sm transition-all" />
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:-translate-y-1 z-[60]">
        <div className="bg-popover/95 backdrop-blur-sm text-popover-foreground font-medium text-xs rounded-md shadow-xl p-3 border border-border leading-relaxed text-center">
          {content}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-b border-r border-border rotate-45"></div>
        </div>
      </div>
    </div>
  );
}
