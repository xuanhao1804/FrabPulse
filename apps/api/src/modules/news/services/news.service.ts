import { Injectable, Logger } from '@nestjs/common';
import { VERIFIED_SOURCES, NewsSource } from '@frabpulse/shared';
import { FinancialNewsProvider } from '../providers/mock-financial-news.provider';
import { RawArticleDto } from '../interfaces/news-provider.interface';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly newsProvider: FinancialNewsProvider) {}

  getVerifiedSources(): NewsSource[] {
    return Object.values(VERIFIED_SOURCES);
  }

  async getLatestArticles(): Promise<RawArticleDto[]> {
    return this.newsProvider.fetchLatestArticles();
  }
}
