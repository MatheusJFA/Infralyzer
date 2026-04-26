"use client"

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 border border-paper-outline hover:border-paper-primary transition-all active:scale-95 bg-card flex items-center justify-center text-paper-primary hover:bg-paper-primary/5"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? (
        <Moon size={16} />
      ) : (
        <Sun size={16} />
      )}
    </button>
  );
}
