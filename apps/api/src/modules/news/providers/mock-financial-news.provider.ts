import { Injectable, Logger } from '@nestjs/common';
import { INewsProvider, RawArticleDto } from '../interfaces/news-provider.interface';
import { SEED_MARKET_EVENTS } from '../../../database/seed-data';

@Injectable()
export class FinancialNewsProvider implements INewsProvider {
  private readonly logger = new Logger(FinancialNewsProvider.name);
  readonly providerCode = 'VERIFIED_FEED_AGGREGATOR';

  async fetchLatestArticles(): Promise<RawArticleDto[]> {
    this.logger.debug('Aggregating accredited financial articles...');
    const articles: RawArticleDto[] = [];

    for (const evt of SEED_MARKET_EVENTS) {
      for (const src of evt.sources) {
        articles.push({
          sourceCode: src.sourceId.replace('src-', '').toUpperCase(),
          url: src.articleUrl,
          title: src.articleTitle,
          summary: src.excerpt || src.articleTitle,
          publishedAt: src.publishedAt
        });
      }
    }

    return articles;
  }
}
