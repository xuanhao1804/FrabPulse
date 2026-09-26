import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, Scale, Cpu, AlertTriangle, Layers, BookOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Methodology, Data Transparency & Epistemology | FrabPulse',
  description:
    'Learn how FrabPulse separates observed market facts from journalist interpretations and AI summaries, computes the Vietnam vs World gold gap, and handles temporal correlation.',
  alternates: {
    canonical: 'https://frabpulse.com/methodology'
  },
  openGraph: {
    title: 'Methodology, Data Transparency & Epistemology | FrabPulse',
    description: 'Learn how FrabPulse separates observed market facts from source interpretations and AI extraction.'
  }
};

export default function MethodologyPage() {
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://frabpulse.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Methodology & Epistemology',
        item: 'https://frabpulse.com/methodology'
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {/* Title */}
      <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-pulse-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            Data Integrity & Epistemology
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          FrabPulse Methodology Standard
        </h1>
        <p className="text-sm text-slate-600 dark:text-pulse-300 max-w-2xl leading-relaxed">
          How FrabPulse enforces verifiable source attribution, separates empirical facts from reporting narratives, and eliminates hallucinated market causality.
        </p>
      </div>

      {/* Section 1: The Three Epistemic Layers */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>1. The Three Epistemic Layers</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-pulse-300 leading-relaxed">
          Traditional financial portals frequently merge factual market data with speculative commentary into single ungrounded claims (e.g. &ldquo;Gold plunged because of hawkish Fed tone&rdquo;). FrabPulse strictly isolates these into three distinct operational layers:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-white dark:bg-pulse-900/80 border border-slate-200 dark:border-emerald-500/30 shadow-sm space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              LAYER 1
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Observed Facts</h3>
            <p className="text-xs text-slate-500 dark:text-pulse-400 leading-relaxed">
              Mathematical price recordings, exact ISO 8601 timestamps, bid-ask spreads, and measured percentage changes before and after an announcement. Zero editorialization.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-pulse-900/80 border border-slate-200 dark:border-blue-500/30 shadow-sm space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
              LAYER 2
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Source Interpretations</h3>
            <p className="text-xs text-slate-500 dark:text-pulse-400 leading-relaxed">
              Verbatim quotes and attributed viewpoints reported by accredited institutional outlets (Reuters, Bloomberg, VnExpress). Full source URLs and publication timestamps are permanently linked.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-pulse-900/80 border border-slate-200 dark:border-purple-500/30 shadow-sm space-y-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold">
              LAYER 3
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Synthesis</h3>
            <p className="text-xs text-slate-500 dark:text-pulse-400 leading-relaxed">
              Structured machine extraction that extracts entities, identifies consensus, and surfaces divergent arguments without introducing platform-generated causal statements.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Correlation vs. Causation */}
      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-pulse-900/70 border border-slate-200 dark:border-pulse-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-500" />
          <span>2. Temporal Correlation vs. Causal Proof</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-600 dark:text-pulse-300 leading-relaxed">
          <p>
            When an event occurs (e.g. an FOMC rate decision or a State Bank of Vietnam circular), FrabPulse measures price movements across defined rolling windows (such as $-30$ minutes to $+30$ minutes).
          </p>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-pulse-950 font-mono text-[11px] text-amber-700 dark:text-amber-300 border border-amber-500/20">
            Rule: Associated movement is reported as empirical correlation. It is never stated as proven exclusive causation.
          </div>
          <p>
            In financial markets, multiple macro vectors (treasury yields, FX fluctuations, equity sentiment) operate concurrently. FrabPulse presents the temporal data transparently and allows analysts to evaluate the multi-source evidence.
          </p>
        </div>
      </section>

      {/* Section 3: Vietnam vs. World Gold Gap Math */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>3. Vietnam vs. World Gold Gap Formula</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-600 dark:text-pulse-300 leading-relaxed">
          <p>
            In Vietnam, domestic gold (notably SJC 9999 bullion) trades in units of <strong>lượng</strong> (cây), while international gold is quoted in <strong>troy ounces</strong> (oz). The conversion is governed by physical mass:
          </p>

          <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-slate-700 dark:text-pulse-200 bg-slate-50 dark:bg-pulse-950 p-4 rounded-xl border border-slate-200 dark:border-pulse-800">
            <li>1 lượng (cây) = 37.5 grams = 10 chỉ</li>
            <li>1 troy ounce (oz) = 31.1034768 grams</li>
            <li>Conversion ratio = 37.5 / 31.1034768 = 1.20565 troy oz per lượng</li>
          </ul>

          <div className="p-4 rounded-xl bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800 space-y-2 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mathematical Gap Equation:</h4>
            <code className="block font-mono text-[11px] text-emerald-600 dark:text-emerald-300">
              World Price in VND = (XAU/USD × USD/VND × 1.20565)
            </code>
            <code className="block font-mono text-[11px] text-emerald-600 dark:text-emerald-300">
              Gap (VND) = Domestic SJC Sell Price - World Price in VND
            </code>
            <code className="block font-mono text-[11px] text-emerald-600 dark:text-emerald-300">
              Gap (%) = (Gap / World Price in VND) × 100%
            </code>
          </div>
        </div>
      </section>

      {/* Section 4: Data Freshness & Environment Limitations */}
      <section className="space-y-4 p-6 rounded-2xl bg-white dark:bg-pulse-900/70 border border-slate-200 dark:border-pulse-800 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-slate-500 dark:text-pulse-400" />
          <span>4. Data Freshness & Environment Limitations</span>
        </h2>
        <div className="space-y-3 text-xs text-slate-600 dark:text-pulse-300 leading-relaxed">
          <p>
            <strong>Local Development Mode:</strong> To allow developers to immediately clone and run FrabPulse without expensive enterprise API subscriptions, the local environment runs deterministic fixtures with simulated real-time SSE ticks.
          </p>
          <p>
            <strong>Production Mode:</strong> When configured with live provider adapters and PostgreSQL, real-time polling or websocket feeds ingest quotes from SJC, DOJI, Kitco, and official State Bank reference desks.
          </p>
        </div>
      </section>

      <div className="pt-4 border-t border-slate-200 dark:border-pulse-800 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <span>Return to Gold Pulse Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
