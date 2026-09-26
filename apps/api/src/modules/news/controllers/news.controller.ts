import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from '../services/news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('sources')
  getSources() {
    return this.newsService.getVerifiedSources();
  }

  @Get('articles')
  async getArticles(
    @Query('limit') limit?: string,
    @Query('q') query?: string
  ) {
    const numLimit = limit ? Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100) : 25;
    return this.newsService.getLatestArticles(numLimit, query);
  }
}
