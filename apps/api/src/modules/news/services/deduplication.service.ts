import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RawArticleDto } from '../interfaces/news-provider.interface';

@Injectable()
export class DeduplicationService {
  private readonly logger = new Logger(DeduplicationService.name);

  /**
   * Canonicalizes URL by removing tracking query parameters (utm_*, ref, etc.)
   * and normalizing trailing slashes and casing.
   */
  canonicalizeUrl(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl.trim());
      // Strip common analytics and affiliate parameters
      const paramsToStrip = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'ref',
        'fbclid',
        'gclid',
        'session_id'
      ];

      paramsToStrip.forEach((param) => parsed.searchParams.delete(param));
      parsed.hash = '';

      let pathname = parsed.pathname;
      if (pathname.length > 1 && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }

      return `${parsed.protocol}//${parsed.host}${pathname}${parsed.search ? parsed.search : ''}`;
    } catch {
      return rawUrl.trim().toLowerCase();
    }
  }

  /**
   * Generates a stable SHA-256 hash of the canonical URL.
   */
  hashUrl(url: string): string {
    const canonical = this.canonicalizeUrl(url);
    return crypto.createHash('sha256').update(canonical).digest('hex');
  }

  /**
   * Computes Jaccard word-set similarity index in [0, 1] between two titles.
   */
  computeTitleSimilarity(titleA: string, titleB: string): number {
    const tokenize = (text: string) =>
      new Set(
        text
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 2)
      );

    const setA = tokenize(titleA);
    const setB = tokenize(titleB);

    if (setA.size === 0 && setB.size === 0) return 1.0;
    if (setA.size === 0 || setB.size === 0) return 0.0;

    let intersectionSize = 0;
    setA.forEach((word) => {
      if (setB.has(word)) intersectionSize++;
    });

    const unionSize = setA.size + setB.size - intersectionSize;
    return unionSize === 0 ? 0 : intersectionSize / unionSize;
  }

  /**
   * Determines if an incoming article is duplicate against a pool of existing articles.
   * Duplicate if:
   * 1. Exact canonical URL hash match, OR
   * 2. Title similarity >= 0.82 within a 24-hour publication window.
   */
  isDuplicate(incoming: RawArticleDto, existingPool: RawArticleDto[]): boolean {
    const incomingUrlHash = this.hashUrl(incoming.url);
    const incomingTime = new Date(incoming.publishedAt).getTime();

    for (const existing of existingPool) {
      if (this.hashUrl(existing.url) === incomingUrlHash) {
        return true;
      }

      const existingTime = new Date(existing.publishedAt).getTime();
      const timeDiffHours = Math.abs(incomingTime - existingTime) / (1000 * 60 * 60);

      if (timeDiffHours <= 24) {
        const similarity = this.computeTitleSimilarity(incoming.title, existing.title);
        if (similarity >= 0.82) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Filters out duplicates from a list of raw articles in-place.
   */
  deduplicateArticles(articles: RawArticleDto[]): RawArticleDto[] {
    const uniquePool: RawArticleDto[] = [];

    for (const article of articles) {
      if (!this.isDuplicate(article, uniquePool)) {
        uniquePool.push(article);
      }
    }

    return uniquePool;
  }
}
