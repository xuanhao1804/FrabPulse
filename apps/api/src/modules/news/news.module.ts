import { Module } from '@nestjs/common';
import { NewsController } from './controllers/news.controller';
import { NewsService } from './services/news.service';
import { FinancialNewsProvider } from './providers/mock-financial-news.provider';

@Module({
  controllers: [NewsController],
  providers: [NewsService, FinancialNewsProvider],
  exports: [NewsService]
})
export class NewsModule {}
