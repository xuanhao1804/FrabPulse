import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';
import { DemoBanner } from '../components/brand/DemoBanner';

export const metadata: Metadata = {
  metadataBase: new URL('https://frabpulse.com'),
  title: {
    default: 'FrabPulse — Real-time Event Intelligence (Gold Pulse)',
    template: '%s | FrabPulse'
  },
  description:
    'Real-time event intelligence platform connecting Vietnamese gold quotes (SJC, DOJI, PNJ), global spot gold (XAU/USD), and accredited news dispatches with empirical temporal correlation.',
  keywords: [
    'gold price vietnam',
    'gia vang sjc hom nay',
    'xau usd spot gold',
    'vietnam gold gap',
    'event intelligence',
    'market correlation',
    'doji gold rate',
    'pnj gold bullion'
  ],
  authors: [{ name: 'FrabPulse Engineering' }],
  creator: 'FrabPulse Lab',
  publisher: 'FrabPulse',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://frabpulse.com',
    siteName: 'FrabPulse',
    title: 'FrabPulse — Real-time Event Intelligence (Gold Pulse)',
    description:
      'Understand what moves, when it moves. Connect market movements with verified sources and AI intelligence without ungrounded causal speculation.'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrabPulse — Real-time Event Intelligence',
    description: 'Empirical market movement and source-grounded event intelligence.'
  },
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization and WebSite Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://frabpulse.com/#organization',
        name: 'FrabPulse',
        url: 'https://frabpulse.com',
        logo: 'https://frabpulse.com/logo.png',
        sameAs: ['https://github.com/xuanhao1804/FrabPulse'],
        description: 'Real-time Event Intelligence Platform connecting market data, verified sources, and AI extraction.'
      },
      {
        '@type': 'WebSite',
        '@id': 'https://frabpulse.com/#website',
        url: 'https://frabpulse.com',
        name: 'FrabPulse',
        publisher: { '@id': 'https://frabpulse.com/#organization' },
        description: 'Real-time event intelligence for gold, macro, and financial markets.'
      }
    ]
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-pulse-950 text-slate-100 antialiased bg-lab-grid selection:bg-emerald-500/30 selection:text-emerald-300 pb-16 md:pb-0">
        <DemoBanner />
        <Navbar />
        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-pulse-800/80 bg-pulse-950 py-8 mt-16 text-center text-xs text-pulse-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">FrabPulse</span>
              <span>— Real-time Event Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-pulse-400 flex-wrap justify-center">
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
