'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MarketEvent, formatPercent, formatUsd, formatVndMillions } from '@frabpulse/shared';
import { fetchEventById } from '../../../lib/api-client';
import {
  ArrowLeft,
  Calendar,
  Clock,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  ExternalLink,
  Cpu,
  FileText,
  AlertTriangle,
  Scale
} from 'lucide-react';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [event, setEvent] = useState<MarketEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchEventById(id)
      .then((data) => setEvent(data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full mb-3" />
        <p className="text-sm text-pulse-400">Loading verified event intelligence...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-xs text-pulse-400 mb-6">
          The requested market event identifier does not exist or has been archived.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pulse-900 border border-pulse-800 text-sm text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-mono text-pulse-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO EVENT STREAM</span>
        </button>
      </div>

      {/* Header & Meta */}
      <div className="space-y-3 pb-6 border-b border-pulse-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {event.eventType}
          </span>
          <span className="text-xs text-pulse-400 flex items-center gap-1 font-mono">
            <Calendar className="w-3.5 h-3.5 text-pulse-500" />
            <span>{new Date(event.happenedAt).toUTCString()}</span>
          </span>
          <span className="text-xs text-pulse-500">•</span>
          <span className="text-xs text-pulse-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-pulse-500" />
            <span>Detected in +{Math.round((new Date(event.detectedAt).getTime() - new Date(event.happenedAt).getTime()) / 1000)}s</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
          {event.title}
        </h1>

        <p className="text-sm text-pulse-300 leading-relaxed max-w-3xl">
          {event.summary}
        </p>

        {/* Entities involved */}
        <div className="flex items-center gap-2 pt-2 flex-wrap">
          <span className="text-xs text-pulse-500">Key Entities:</span>
          {event.entities.map((entity) => (
            <span
              key={entity}
              className="text-xs font-mono px-2 py-0.5 rounded bg-pulse-900 border border-pulse-800 text-pulse-300"
            >
              {entity}
            </span>
          ))}
        </div>
      </div>

      {/* Epistemological Separation Layer 1: Observed Factual Movements */}
      <div className="rounded-2xl bg-pulse-900/90 border border-pulse-800 p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Layer 1: Observed Market Movements
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                EMPIRICAL FACTS
              </span>
            </div>
            <p className="text-xs text-pulse-400">
              Mathematical price measurements across the temporal observation window
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {event.relatedAssets.map((rel) => {
            const isUp = rel.deltaPercent >= 0;
            const isVnd = rel.assetCode === 'SJC_VN' || rel.assetCode === 'USD_VND';

            return (
              <div
                key={rel.assetCode}
                className="p-4 rounded-xl bg-pulse-950/80 border border-pulse-800/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-pulse-300">
                    {rel.assetCode} ({rel.assetName})
                  </span>
                  <div
                    className={`flex items-center text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isUp
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isUp ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-1" />
                    )}
                    <span>{formatPercent(rel.deltaPercent)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-pulse-500 block text-[10px]">Price Before</span>
                    <span className="font-mono text-pulse-200">
                      {isVnd ? formatVndMillions(rel.priceBefore) : formatUsd(rel.priceBefore)}
                    </span>
                  </div>
                  <div>
                    <span className="text-pulse-500 block text-[10px]">Price After</span>
                    <span className="font-mono text-white font-semibold">
                      {isVnd ? formatVndMillions(rel.priceAfter) : formatUsd(rel.priceAfter)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-pulse-400 pt-2 border-t border-pulse-900 flex justify-between">
                  <span>Delta: {isVnd ? formatVndMillions(rel.deltaAbsolute) : formatUsd(rel.deltaAbsolute)}</span>
                  <span>Window: {rel.windowMinutes} mins</span>
                </div>

                <p className="text-[11px] text-pulse-500 italic bg-pulse-900/50 p-2 rounded">
                  {rel.correlationCaveat}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Epistemological Separation Layer 2: Source Interpretations & Direct Attribution */}
      <div className="rounded-2xl bg-pulse-900/90 border border-pulse-800 p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Layer 2: Source Interpretations & Attribution
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                VERIFIED OUTLETS
              </span>
            </div>
            <p className="text-xs text-pulse-400">
              Direct statements and narrative explanations documented by accredited financial journalists
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {event.sources.map((src) => (
            <div
              key={src.articleUrl}
              className="p-4 rounded-xl bg-pulse-950/80 border border-pulse-800/80 hover:border-pulse-700 transition-colors"
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-400">{src.sourceName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pulse-900 text-pulse-400 border border-pulse-800">
                    {src.citationRole}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-pulse-500">
                  {new Date(src.publishedAt).toLocaleTimeString()} UTC
                </span>
              </div>

              <h4 className="text-sm font-semibold text-white mb-1.5">{src.articleTitle}</h4>
              {src.excerpt && (
                <blockquote className="text-xs text-pulse-300 italic border-l-2 border-emerald-500/40 pl-3 py-1 my-2 bg-pulse-900/40 rounded-r">
                  &ldquo;{src.excerpt}&rdquo;
                </blockquote>
              )}

              <a
                href={src.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-pulse-400 hover:text-emerald-400 mt-2 transition-colors font-mono"
              >
                <span>Read original dispatch on {src.sourceDomain}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Epistemological Separation Layer 3: AI-Generated Structured Synthesis */}
      <div className="rounded-2xl bg-pulse-900/90 border border-purple-500/20 p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">
                Layer 3: AI Structured Synthesis
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                SOURCE-GROUNDED SYNTHESIS
              </span>
            </div>
            <p className="text-xs text-pulse-400">
              Algorithmic extraction of consensus without unverified causal claims
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-pulse-200">
          <div className="p-4 rounded-xl bg-pulse-950/80 border border-pulse-800/80">
            <h4 className="text-xs font-bold text-white mb-1">Factual Context</h4>
            <p className="leading-relaxed text-pulse-300">{event.synthesis.factualContext}</p>
          </div>

          <div className="p-4 rounded-xl bg-pulse-950/80 border border-pulse-800/80">
            <h4 className="text-xs font-bold text-white mb-1">Source Consensus</h4>
            <p className="leading-relaxed text-pulse-300">{event.synthesis.sourceConsensus}</p>
          </div>

          {event.synthesis.divergentPoints && event.synthesis.divergentPoints.length > 0 && (
            <div className="p-4 rounded-xl bg-pulse-950/80 border border-pulse-800/80">
              <h4 className="text-xs font-bold text-white mb-1">Divergent Perspectives</h4>
              <ul className="list-disc list-inside space-y-1 text-pulse-400">
                {event.synthesis.divergentPoints.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Methodology Warning / Guardrail Card */}
      <div className="p-4 rounded-xl bg-pulse-950/90 border border-amber-500/20 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-pulse-300">
          <strong className="text-amber-300 font-semibold block mb-0.5">
            FrabPulse Correlation Notice
          </strong>
          <span>{event.methodologyNotes}</span>
        </div>
      </div>
    </div>
  );
}
