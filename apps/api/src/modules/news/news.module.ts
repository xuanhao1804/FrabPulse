import { Module } from '@nestjs/common';
import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';
import { RssFeedNewsProvider } from './providers/rss-feed.provider';
import { DeduplicationService } from './services/deduplication.service';
import { FinancialNewsProvider } from './providers/mock-financial-news.provider';

@Module({
  controllers: [NewsController],
  providers: [NewsService, RssFeedNewsProvider, DeduplicationService, FinancialNewsProvider],
  exports: [NewsService, DeduplicationService]
})
export class NewsModule {}
