import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeduplicationService } from '../src/modules/news/services/deduplication.service';
import { RssFeedNewsProvider } from '../src/modules/news/providers/rss-feed.provider';
import { NewsService } from '../src/modules/news/services/news.service';

describe('News Ingestion & Deduplication Pipeline (Task 1.5.2)', () => {
  let deduplicationService: DeduplicationService;

  beforeEach(() => {
    vi.restoreAllMocks();
    deduplicationService = new DeduplicationService();
  });

  describe('DeduplicationService', () => {
    it('should canonicalize URLs by removing tracking query parameters and trailing slashes', () => {
      const rawUrl1 = 'https://vnexpress.net/gia-vang-sjc-lap-dinh-moi-123.html?utm_source=facebook&utm_medium=cpc&fbclid=xyz123/';
      const rawUrl2 = 'https://vnexpress.net/gia-vang-sjc-lap-dinh-moi-123.html';

      const canonical1 = deduplicationService.canonicalizeUrl(rawUrl1);
      const canonical2 = deduplicationService.canonicalizeUrl(rawUrl2);

      expect(canonical1).toBe(canonical2);
      expect(deduplicationService.hashUrl(rawUrl1)).toBe(deduplicationService.hashUrl(rawUrl2));
    });

    it('should compute high Jaccard title similarity for paraphrased/overlapping titles', () => {
      const titleA = 'Giá vàng SJC hôm nay tăng vọt lên mức kỷ lục 90 triệu đồng';
      const titleB = 'Giá vàng SJC hôm nay lập kỷ lục mới 90 triệu đồng';
      const titleC = 'Thị trường chứng khoán phục hồi mạnh mẽ trong phiên chiều';

      const simAB = deduplicationService.computeTitleSimilarity(titleA, titleB);
      const simAC = deduplicationService.computeTitleSimilarity(titleA, titleC);

      expect(simAB).toBeGreaterThanOrEqual(0.55);
      expect(simAC).toBeLessThan(0.20);
    });

    it('should identify duplicate articles by canonical URL hash', () => {
      const pool = [
        {
          sourceCode: 'VNEXPRESS',
          url: 'https://vnexpress.net/tin-vang-1.html',
          title: 'Tin tức vàng đầu ngày',
          summary: 'Tóm tắt bài 1',
          publishedAt: '2026-09-26T08:00:00Z'
        }
      ];

      const incomingDuplicate = {
        sourceCode: 'VNEXPRESS',
        url: 'https://vnexpress.net/tin-vang-1.html?utm_source=feedly',
        title: 'Tin tức vàng đầu ngày (updated)',
        summary: 'Tóm tắt',
        publishedAt: '2026-09-26T08:10:00Z'
      };

      const isDup = deduplicationService.isDuplicate(incomingDuplicate, pool);
      expect(isDup).toBe(true);
    });

    it('should filter out duplicate articles from a mixed list', () => {
      const list = [
        {
          sourceCode: 'VNEXPRESS',
          url: 'https://vnexpress.net/tin-a.html',
          title: 'Giá vàng SJC tăng phi mã',
          summary: 'Nội dung',
          publishedAt: '2026-09-26T08:00:00Z'
        },
        {
          sourceCode: 'VNEXPRESS',
          url: 'https://vnexpress.net/tin-a.html?ref=home',
          title: 'Giá vàng SJC tăng phi mã',
          summary: 'Nội dung trùng',
          publishedAt: '2026-09-26T08:05:00Z'
        },
        {
          sourceCode: 'TUOI_TRE',
          url: 'https://tuoitre.vn/tin-b.html',
          title: 'Ngân hàng Nhà nước tổ chức đấu thầu vàng',
          summary: 'Nội dung riêng',
          publishedAt: '2026-09-26T09:00:00Z'
        }
      ];

      const deduplicated = deduplicationService.deduplicateArticles(list);
      expect(deduplicated).toHaveLength(2);
      expect(deduplicated[0].url).toContain('tin-a.html');
      expect(deduplicated[1].url).toContain('tin-b.html');
    });
  });

  describe('RssFeedNewsProvider', () => {
    it('should parse RSS 2.0 XML with CDATA and clean HTML tags from descriptions', () => {
      const provider = new RssFeedNewsProvider(deduplicationService);

      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Kinh doanh</title>
    <item>
      <title><![CDATA[Giá vàng SJC vượt đỉnh 90 triệu đồng/lượng]]></title>
      <description><![CDATA[<a href="link"><img src="thumb.jpg"></a>Giá vàng trong nước sáng nay tăng mạnh theo đà thế giới.]]></description>
      <link>https://vnexpress.net/gia-vang-sjc-vuot-dinh-123.html</link>
      <pubDate>Sat, 26 Sep 2026 08:30:00 +0700</pubDate>
    </item>
  </channel>
</rss>`;

      const articles = provider.parseRssXml(sampleXml, 'VNEXPRESS');
      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe('Giá vàng SJC vượt đỉnh 90 triệu đồng/lượng');
      expect(articles[0].summary).toBe('Giá vàng trong nước sáng nay tăng mạnh theo đà thế giới.');
      expect(articles[0].url).toBe('https://vnexpress.net/gia-vang-sjc-vuot-dinh-123.html');
      expect(articles[0].sourceCode).toBe('VNEXPRESS');
      expect(new Date(articles[0].publishedAt).getTime()).not.toBeNaN();
    });

    it('should gracefully fall back to seed news fixtures when remote RSS feeds are unreachable', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('DNS lookup failure'));

      const provider = new RssFeedNewsProvider(deduplicationService);
      const articles = await provider.fetchLatestArticles(10);

      expect(articles.length).toBeGreaterThan(0);
      expect(articles[0].title).toBeDefined();
      expect(articles[0].url).toBeDefined();
    });
  });

  describe('NewsService', () => {
    it('should return verified sources with accredited credibility scores', () => {
      const provider = new RssFeedNewsProvider(deduplicationService);
      const service = new NewsService(provider);

      const sources = service.getVerifiedSources();
      expect(sources.length).toBeGreaterThanOrEqual(5);

      const reuters = sources.find((s) => s.code === 'REUTERS')!;
      expect(reuters.credibilityScore).toBeGreaterThanOrEqual(0.95);

      const vnexpress = sources.find((s) => s.code === 'VNEXPRESS')!;
      expect(vnexpress.credibilityScore).toBeGreaterThanOrEqual(0.90);
    });

    it('should filter articles by search query keywords', async () => {
      const mockProvider = {
        fetchLatestArticles: vi.fn().mockResolvedValue([
          { sourceCode: 'VNEXPRESS', title: 'Giá vàng SJC tăng mạnh', summary: 'Thị trường vàng', url: 'u1', publishedAt: '2026-09-26T00:00:00Z' },
          { sourceCode: 'TUOI_TRE', title: 'Lãi suất ngân hàng giảm', summary: 'Tiền tệ', url: 'u2', publishedAt: '2026-09-26T01:00:00Z' },
          { sourceCode: 'YAHOO', title: 'Oil prices edge lower', summary: 'Energy', url: 'u3', publishedAt: '2026-09-26T02:00:00Z' }
        ])
      } as unknown as RssFeedNewsProvider;

      const service = new NewsService(mockProvider);
      const goldArticles = await service.getLatestArticles(10, 'vàng');

      expect(goldArticles).toHaveLength(1);
      expect(goldArticles[0].title).toContain('vàng');
    });
  });
});
