import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTopicBySlug, TOPIC_DEFINITIONS, formatPercent } from '@frabpulse/shared';
import { fetchMarketEvents } from '../../../lib/api-client';
import { ArrowLeft, Compass, Calendar, ShieldCheck, Clock, ExternalLink, ChevronRight } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.values(TOPIC_DEFINITIONS).map((topic) => ({
    slug: topic.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    return {
      title: 'Topic Not Found | FrabPulse'
    };
  }

  return {
    title: `${topic.title} — Market Event Intelligence | FrabPulse`,
    description: topic.description,
    alternates: {
      canonical: `https://frabpulse.com/topics/${slug}`
    },
    openGraph: {
      title: `${topic.title} — Event Intelligence`,
      description: topic.description
    }
  };
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);

  if (!topic) {
    notFound();
  }

  const allEvents = await fetchMarketEvents();
  const topicEvents = allEvents.filter((evt) => evt.eventType === topic.eventType);

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
        name: 'Topics',
        item: `https://frabpulse.com/topics/${slug}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: topic.shortName,
        item: `https://frabpulse.com/topics/${slug}`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-pulse-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO DASHBOARD</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-pulse-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Compass className="w-4 h-4" />
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            TOPIC RADAR: {topic.shortName}
          </span>
          <span className="text-xs text-pulse-500">•</span>
          <span className="text-xs text-pulse-400 font-mono">{topicEvents.length} RECORDED EVENTS</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {topic.title}
        </h1>

        <p className="text-xs sm:text-sm text-pulse-300 leading-relaxed max-w-3xl">
          {topic.description}
        </p>
      </div>

      {/* Events Listing */}
      <section aria-labelledby="topic-events-heading" className="space-y-4">
        <h2 id="topic-events-heading" className="text-base font-bold text-white tracking-tight">
          Grounded Market Events Under &ldquo;{topic.shortName}&rdquo;
        </h2>

        {topicEvents.length > 0 ? (
          <div className="space-y-4">
            {topicEvents.map((evt) => (
              <div
                key={evt.id}
                className="rounded-2xl bg-pulse-900/90 border border-pulse-800 hover:border-pulse-700 p-5 space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <span className="text-xs text-pulse-400 font-mono flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-pulse-500" />
                    <span>{new Date(evt.happenedAt).toUTCString()}</span>
                  </span>

                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {Math.round(evt.confidence * 100)}% source convergence
                  </span>
                </div>

                <Link href={`/events/${evt.id}`}>
                  <h3 className="text-base font-bold text-white hover:text-emerald-300 transition-colors">
                    {evt.title}
                  </h3>
                </Link>

                <p className="text-xs text-pulse-300 leading-relaxed">
                  {evt.summary}
                </p>

                {/* Associated Deltas */}
                <div className="pt-3 border-t border-pulse-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-pulse-500 text-[11px]">Associated Delta:</span>
                    {evt.relatedAssets.map((rel) => {
                      const isUp = rel.deltaPercent >= 0;
                      return (
                        <span
                          key={rel.assetCode}
                          className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                            isUp
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {rel.assetCode} {formatPercent(rel.deltaPercent)} ({rel.windowMinutes}m)
                        </span>
                      );
                    })}
                  </div>

                  <Link
                    href={`/events/${evt.id}`}
                    className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs font-mono"
                  >
                    <span>Full Evidence Breakdown</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-pulse-950 border border-pulse-800 text-center text-xs text-pulse-400">
            No market events currently registered under this topic.
          </div>
        )}
      </section>

      {/* Explore other topics */}
      <section className="pt-6 border-t border-pulse-800 space-y-3">
        <span className="text-xs text-pulse-500 font-mono block">EXPLORE OTHER INTELLIGENCE TOPICS:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(TOPIC_DEFINITIONS)
            .filter((t) => t.slug !== topic.slug)
            .map((other) => (
              <Link
                key={other.slug}
                href={`/topics/${other.slug}`}
                className="px-3 py-1.5 rounded-lg bg-pulse-900 hover:bg-pulse-800 text-xs font-mono text-pulse-300 hover:text-emerald-400 border border-pulse-800 transition-colors"
              >
                {other.shortName}
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
