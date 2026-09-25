import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function Logo({ size = 'md', showSubtitle = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link href="/" className="inline-flex items-center gap-3 group select-none">
      {/* Scientist Frog Lab Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-pulse-800 to-pulse-900 border border-emerald-500/30 group-hover:border-emerald-400 transition-colors shadow-lg shadow-emerald-950/40`}
      >
        {/* Stylized Beaker & Pulse waveform SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform"
        >
          {/* Flask shape */}
          <path d="M10 2v7.31L4.69 18.5A2 2 0 0 0 6.4 21.5h11.2a2 2 0 0 0 1.71-3L14 9.31V2" />
          <path d="M8.5 2h7" />
          {/* Internal Pulse waveform */}
          <path d="M7 16h2.5l1.5-3 2 6 1.5-3H17" stroke="#34d399" strokeWidth="1.8" />
        </svg>

        {/* Ambient pulse dot */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-pulse-950 animate-pulse" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`${textSizes[size]} font-bold tracking-tight text-white`}>
            Frab<span className="text-emerald-400">Pulse</span>
          </span>
          <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-medium rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Gold
          </span>
        </div>
        {showSubtitle && (
          <span className="hidden sm:inline text-[11px] text-pulse-400 tracking-wide mt-0.5">
            Real-time Event Intelligence
          </span>
        )}
      </div>
    </Link>
  );
}
