'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 min-h-[38px] min-w-[38px] sm:min-h-[40px] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none border ${
        resolvedTheme === 'dark'
          ? 'bg-pulse-900/60 hover:bg-pulse-800 text-amber-300 border-pulse-800/80 hover:border-pulse-700'
          : 'bg-slate-50/80 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
      } ${className}`}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
