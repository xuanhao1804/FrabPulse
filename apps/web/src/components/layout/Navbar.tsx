'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../brand/Logo';
import { usePulseStream } from '../../lib/use-pulse-stream';
import {
  Menu,
  X,
  ShieldCheck,
  GitBranch,
  Layers,
  Activity,
  Compass,
  BookOpen
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { status } = usePulseStream();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isOnline = status === 'ONLINE';

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { href: '/', label: 'Gold Pulse', icon: Activity },
    { href: '/gold', label: 'Directory & Hub', icon: Layers },
    { href: '/topics/central-bank', label: 'Topics & Policy', icon: Compass },
    { href: '/methodology', label: 'Methodology & Facts', icon: ShieldCheck }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-pulse-800 bg-pulse-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" />

            <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                      isActive
                        ? 'bg-pulse-800 text-emerald-400 shadow-sm'
                        : 'text-pulse-400 hover:text-white hover:bg-pulse-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Real-time SSE Pulse Status Indicator */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-pulse-900 border border-pulse-800 text-[11px] sm:text-xs">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
                aria-hidden="true"
              />
              <span className="font-mono text-pulse-300 text-[10px] sm:text-xs">
                {isOnline ? 'PULSE ONLINE' : 'SYNCING'}
              </span>
            </div>

            <a
              href="https://github.com/xuanhao1804/FrabPulse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View FrabPulse on GitHub"
              className="hidden sm:flex items-center gap-1.5 text-xs text-pulse-400 hover:text-white min-h-[44px] px-3 py-2 rounded-lg bg-pulse-900 hover:bg-pulse-800 border border-pulse-800 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
              <span>GitHub</span>
            </a>

            {/* Mobile Hamburger Button with 44px touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-pulse-900 border border-pulse-800 text-pulse-300 hover:text-white hover:bg-pulse-850 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden border-b border-pulse-800 bg-pulse-950/95 backdrop-blur-lg px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200"
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                      isActive
                        ? 'bg-pulse-800 text-emerald-400 border border-emerald-500/20'
                        : 'text-pulse-300 hover:bg-pulse-900 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-pulse-900 mt-2 flex items-center justify-between text-xs text-pulse-400">
                <a
                  href="https://github.com/xuanhao1804/FrabPulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-pulse-300 hover:text-white"
                >
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  <span>GitHub Repository</span>
                </a>
                <span className="font-mono text-[11px] text-pulse-500">v0.1.0-alpha</span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Persistent Mobile Bottom Navigation Bar (< md) for thumb-friendly navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-pulse-950/95 backdrop-blur border-t border-pulse-800/90 px-2 py-1.5 flex items-center justify-around"
        aria-label="Mobile quick bottom navigation"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-mono transition-colors ${
            pathname === '/' ? 'text-emerald-400 font-bold' : 'text-pulse-400 hover:text-pulse-200'
          }`}
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>Radar</span>
        </Link>

        <Link
          href="/gold"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-mono transition-colors ${
            pathname.startsWith('/gold') ? 'text-emerald-400 font-bold' : 'text-pulse-400 hover:text-pulse-200'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>Gold Hub</span>
        </Link>

        <Link
          href="/topics/central-bank"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-mono transition-colors ${
            pathname.startsWith('/topics') ? 'text-emerald-400 font-bold' : 'text-pulse-400 hover:text-pulse-200'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Topics</span>
        </Link>

        <Link
          href="/methodology"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[10px] font-mono transition-colors ${
            pathname === '/methodology' ? 'text-emerald-400 font-bold' : 'text-pulse-400 hover:text-pulse-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Method</span>
        </Link>
      </nav>
    </>
  );
}
