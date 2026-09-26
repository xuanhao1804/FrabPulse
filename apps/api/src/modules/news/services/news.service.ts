import { Injectable, Logger } from '@nestjs/common';
import { VERIFIED_SOURCES, NewsSource } from '@frabpulse/shared';
import { RssFeedNewsProvider } from '../providers/rss-feed.provider';
import { RawArticleDto } from '../interfaces/news-provider.interface';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly rssProvider: RssFeedNewsProvider) {}

  getVerifiedSources(): NewsSource[] {
    return Object.values(VERIFIED_SOURCES);
  }

  async getLatestArticles(limit = 25, query?: string): Promise<RawArticleDto[]> {
    const articles = await this.rssProvider.fetchLatestArticles(limit * 2);
    if (!query) {
      return articles.slice(0, limit);
    }

    const q = query.toLowerCase();
    return articles
      .filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
      .slice(0, limit);
  }
}
