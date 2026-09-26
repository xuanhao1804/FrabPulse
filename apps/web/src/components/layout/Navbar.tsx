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

import { ThemeToggle } from '../theme/ThemeToggle';
import { LanguageToggle } from '../theme/LanguageToggle';
import { TimezoneToggle } from '../theme/TimezoneToggle';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function Navbar() {
  const pathname = usePathname();
  const { status } = usePulseStream();
  const { t } = useLanguage();
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
    { href: '/', label: t.nav.radar, icon: Activity },
    { href: '/gold', label: t.nav.goldHub, icon: Layers },
    { href: '/topics/central-bank', label: t.nav.topics, icon: Compass },
    { href: '/methodology', label: t.nav.methodology, icon: ShieldCheck }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-pulse-800 bg-white/85 dark:bg-pulse-950/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo size="md" />

            <nav className="hidden lg:flex items-center gap-1 ml-2" aria-label="Desktop Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-emerald-700 dark:bg-pulse-800/90 dark:text-emerald-400 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-pulse-900/60'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Real-time SSE Pulse Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 text-xs text-slate-500 dark:text-slate-400">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
                aria-hidden="true"
              />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-600 dark:text-slate-300">
                {isOnline ? 'LIVE FEED' : 'SYNCING'}
              </span>
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-pulse-800 mx-0.5" />

            {/* Timezone Switcher (ICT / UTC) */}
            <TimezoneToggle />

            {/* Language Switcher (VI / EN) */}
            <LanguageToggle />

            {/* Theme Toggle (Light / Dark mode) */}
            <ThemeToggle />

            <a
              href="https://github.com/xuanhao1804/FrabPulse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View FrabPulse on GitHub"
              className="hidden sm:flex items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-pulse-800/80 bg-slate-50/80 hover:bg-slate-100 dark:bg-pulse-900/60 dark:hover:bg-pulse-800 text-slate-600 dark:text-slate-300 min-h-[38px] min-w-[38px] sm:min-h-[40px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </a>

            {/* Mobile Hamburger Button with 44px touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 dark:bg-pulse-900/80 border border-slate-200 dark:border-pulse-800 text-slate-700 dark:text-pulse-300 hover:bg-slate-200 dark:hover:bg-pulse-850 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.menu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-navigation"
            className="lg:hidden border-b border-slate-200 dark:border-pulse-800 bg-white/95 dark:bg-pulse-950/95 backdrop-blur-lg px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200"
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
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-pulse-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-pulse-300 dark:hover:bg-pulse-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              <div className="pt-3 border-t border-slate-200 dark:border-pulse-900 mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-pulse-400">
                <a
                  href="https://github.com/xuanhao1804/FrabPulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 py-2 text-slate-700 dark:text-pulse-300 hover:text-emerald-600 dark:hover:text-white"
                >
                  <GitBranch className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>GitHub Repository</span>
                </a>
                <span className="font-sans text-[11px] text-slate-400 dark:text-pulse-500">v0.1.0-alpha</span>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Persistent Mobile Bottom Navigation Bar (< md) for thumb-friendly navigation */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-pulse-950/95 backdrop-blur border-t border-slate-200 dark:border-pulse-800/90 px-2 py-1.5 flex items-center justify-around shadow-lg"
        aria-label="Mobile quick bottom navigation"
      >
        <Link
          href="/"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-sans transition-colors ${
            pathname === '/' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800 dark:hover:text-pulse-200'
          }`}
        >
          <Activity className="w-4 h-4 mb-0.5" />
          <span>{t.nav.radar}</span>
        </Link>

        <Link
          href="/gold"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-sans transition-colors ${
            pathname.startsWith('/gold') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800 dark:hover:text-pulse-200'
          }`}
        >
          <Layers className="w-4 h-4 mb-0.5" />
          <span>{t.nav.goldHub}</span>
        </Link>

        <Link
          href="/topics/central-bank"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-sans transition-colors ${
            pathname.startsWith('/topics') ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800 dark:hover:text-pulse-200'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>{t.nav.topics}</span>
        </Link>

        <Link
          href="/methodology"
          className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] py-1 text-[11px] font-sans transition-colors ${
            pathname === '/methodology' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800 dark:hover:text-pulse-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>{t.nav.methodology}</span>
        </Link>
      </nav>
    </>
  );
}
