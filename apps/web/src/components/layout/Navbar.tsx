'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../brand/Logo';
import { usePulseStream } from '../../lib/use-pulse-stream';
import { Activity, BookOpen, GitBranch, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { status } = usePulseStream();

  const isOnline = status === 'ONLINE';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pulse-800 bg-pulse-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'bg-pulse-800 text-emerald-400'
                  : 'text-pulse-400 hover:text-white hover:bg-pulse-900'
              }`}
            >
              Gold Pulse
            </Link>

            <Link
              href="/methodology"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname === '/methodology'
                  ? 'bg-pulse-800 text-emerald-400'
                  : 'text-pulse-400 hover:text-white hover:bg-pulse-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Methodology & Facts</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time SSE Pulse Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-pulse-900 border border-pulse-800 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-pulse-400">
              {isOnline ? 'PULSE STREAM ONLINE' : 'PULSE SYNCHRONIZING'}
            </span>
          </div>

          <a
            href="https://github.com/xuanhao1804/FrabPulse"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-xs text-pulse-400 hover:text-white px-3 py-1.5 rounded-lg bg-pulse-900 hover:bg-pulse-800 border border-pulse-800 transition-colors"
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
