import { Controller, Get } from '@nestjs/common';
import { NewsService } from '../services/news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('sources')
  getSources() {
    return this.newsService.getVerifiedSources();
  }

  @Get('articles')
  async getArticles() {
    return this.newsService.getLatestArticles();
  }
}
