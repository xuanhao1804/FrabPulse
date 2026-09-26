import { Injectable, Logger } from '@nestjs/common';
import { INewsProvider, RawArticleDto } from '../interfaces/news-provider.interface';
import { DeduplicationService } from '../services/deduplication.service';
import { SEED_MARKET_EVENTS } from '../../../database/seed-data';

import { CircuitBreaker } from '../../../common/circuit-breaker';

interface RssFeedConfig {
  sourceCode: string;
  url: string;
  credibilityScore: number;
}

@Injectable()
export class RssFeedNewsProvider implements INewsProvider {
  private readonly logger = new Logger(RssFeedNewsProvider.name);
  readonly providerCode = 'ACCREDITED_RSS_CRAWLER';

  private readonly feeds: RssFeedConfig[] = [
    {
      sourceCode: 'VNEXPRESS',
      url: 'https://vnexpress.net/rss/kinh-doanh.rss',
      credibilityScore: 0.92
    },
    {
      sourceCode: 'TUOI_TRE',
      url: 'https://tuoitre.vn/rss/kinh-doanh.rss',
      credibilityScore: 0.91
    },
    {
      sourceCode: 'YAHOO_FINANCE',
      url: 'https://finance.yahoo.com/news/rssindex',
      credibilityScore: 0.94
    }
  ];

  private readonly breaker = new CircuitBreaker({
    name: 'RssFeedCrawler',
    failureThreshold: 3,
    resetTimeoutMs: 300_000
  });

  private cachedArticles: RawArticleDto[] = [];
  private lastFetchedAt: string | null = null;

  constructor(private readonly deduplicationService: DeduplicationService) {}

  getCircuitBreaker(): CircuitBreaker {
    return this.breaker;
  }

  async fetchLatestArticles(limit = 30): Promise<RawArticleDto[]> {
    try {
      const aggregated = await this.breaker.execute(
        async () => {
          const feedPromises = this.feeds.map((feed) => this.fetchSingleFeed(feed));
          const results = await Promise.allSettled(feedPromises);

          const items: RawArticleDto[] = [];
          let hasAnySuccess = false;
          results.forEach((res, idx) => {
            if (res.status === 'fulfilled') {
              items.push(...res.value);
              hasAnySuccess = true;
            } else {
              this.logger.warn(`Failed to fetch RSS from ${this.feeds[idx].sourceCode}: ${res.reason?.message}`);
            }
          });

          if (!hasAnySuccess || items.length === 0) {
            throw new Error('All accredited news RSS feeds failed to return articles');
          }

          return items;
        },
        () => []
      );

      if (aggregated.length > 0) {
        // Run deduplication
        const unique = this.deduplicationService.deduplicateArticles(aggregated);

        // Sort by publication recency (newest first)
        unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

        this.cachedArticles = unique;
        this.lastFetchedAt = new Date().toISOString();

        return unique.slice(0, limit);
      }
    } catch (err: any) {
      this.logger.error('Error during RSS ingestion cycle', err.message);
    }

    // Return cached if available
    if (this.cachedArticles.length > 0) {
      return this.cachedArticles.slice(0, limit);
    }

    // Fallback to high-credibility seed articles
    return this.getFallbackSeedArticles(limit);
  }

  private async fetchSingleFeed(feed: RssFeedConfig): Promise<RawArticleDto[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const resp = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) FrabPulse/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8'
        },
        signal: controller.signal
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const xmlText = await resp.text();
      return this.parseRssXml(xmlText, feed.sourceCode);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Lightweight, zero-dependency XML item parser for RSS 2.0.
   */
  parseRssXml(xml: string, sourceCode: string): RawArticleDto[] {
    const articles: RawArticleDto[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match: RegExpExecArray | null;

    while ((match = itemRegex.exec(xml)) !== null) {
      const itemContent = match[1];

      const title = this.extractTag(itemContent, 'title');
      const link = this.extractTag(itemContent, 'link');
      const pubDateRaw = this.extractTag(itemContent, 'pubDate');
      const descriptionRaw = this.extractTag(itemContent, 'description');

      if (!title || !link) continue;

      const cleanSummary = this.cleanHtmlSnippet(descriptionRaw || title);
      const isoDate = this.parseDateToIso(pubDateRaw);

      articles.push({
        sourceCode,
        url: this.deduplicationService.canonicalizeUrl(link),
        title: this.cleanHtmlSnippet(title),
        summary: cleanSummary,
        publishedAt: isoDate
      });
    }

    return articles;
  }

  private extractTag(xmlBlock: string, tagName: string): string | null {
    // Matches either <tag><![CDATA[content]]></tag> or <tag>content</tag>
    const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))<\\/${tagName}>`, 'i');
    const match = regex.exec(xmlBlock);
    if (!match) return null;
    return (match[1] ?? match[2] ?? '').trim();
  }

  private cleanHtmlSnippet(html: string): string {
    return html
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1')
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private parseDateToIso(dateStr: string | null): string {
    if (!dateStr) return new Date().toISOString();
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  }

  private getFallbackSeedArticles(limit: number): RawArticleDto[] {
    const fallback: RawArticleDto[] = [];
    for (const evt of SEED_MARKET_EVENTS) {
      for (const src of evt.sources) {
        fallback.push({
          sourceCode: src.sourceId.replace('src-', '').toUpperCase(),
          url: src.articleUrl,
          title: src.articleTitle,
          summary: src.excerpt || src.articleTitle,
          publishedAt: src.publishedAt
        });
      }
    }
    return fallback.slice(0, limit);
  }
}
