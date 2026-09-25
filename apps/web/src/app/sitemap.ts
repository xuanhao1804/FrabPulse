import type { MetadataRoute } from 'next';
import { ASSET_DEFINITIONS, TOPIC_DEFINITIONS } from '@frabpulse/shared';
import { fetchMarketEvents } from '../lib/api-client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://frabpulse.com';
  const now = new Date();

  // 1. Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0
    },
    {
      url: `${baseUrl}/gold`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];

  // 2. Gold Asset / Provider Pages
  const assetRoutes: MetadataRoute.Sitemap = Object.values(ASSET_DEFINITIONS).map((asset) => ({
    url: `${baseUrl}/gold/${asset.slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.85
  }));

  // 3. Topic Intelligence Pages
  const topicRoutes: MetadataRoute.Sitemap = Object.values(TOPIC_DEFINITIONS).map((topic) => ({
    url: `${baseUrl}/topics/${topic.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8
  }));

  // 4. Clustered Event Pages
  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    const events = await fetchMarketEvents();
    eventRoutes = events.map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.detectedAt),
      changeFrequency: 'weekly',
      priority: 0.75
    }));
  } catch {
    eventRoutes = [];
  }

  return [...staticRoutes, ...assetRoutes, ...topicRoutes, ...eventRoutes];
}
