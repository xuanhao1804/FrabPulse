'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none border ${
        resolvedTheme === 'dark'
          ? 'bg-pulse-900 hover:bg-pulse-850 text-amber-300 border-pulse-800 hover:border-pulse-700'
          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
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
