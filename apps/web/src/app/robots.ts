import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://frabpulse.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/gold', '/gold/*', '/events/*', '/topics/*', '/methodology'],
        disallow: ['/api/*', '/_next/*', '/admin/*', '/internal/*']
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
