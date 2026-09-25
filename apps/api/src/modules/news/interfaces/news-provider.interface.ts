export interface RawArticleDto {
  sourceCode: string;
  url: string;
  title: string;
  summary: string;
  content?: string;
  publishedAt: string;
}

export interface INewsProvider {
  readonly providerCode: string;
  fetchLatestArticles(limit?: number): Promise<RawArticleDto[]>;
}
