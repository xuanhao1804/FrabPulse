import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { DemoBanner } from '../components/brand/DemoBanner';

export const metadata: Metadata = {
  title: 'FrabPulse — Real-time Event Intelligence (Gold Pulse)',
  description:
    'Real-time event intelligence platform connecting gold price movements, verified news dispatches, and macroeconomic events without speculative bias.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-pulse-950 text-slate-100 antialiased bg-lab-grid selection:bg-emerald-500/30 selection:text-emerald-300">
        <DemoBanner />
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-pulse-800/80 bg-pulse-950 py-8 mt-16 text-center text-xs text-pulse-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">FrabPulse</span>
              <span>— Real-time Event Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-pulse-400">
              <span>Gold Pulse Vertical</span>
              <span>•</span>
              <span>Epistemic Separation Standard</span>
              <span>•</span>
              <span>Temporal Correlation Engine</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
