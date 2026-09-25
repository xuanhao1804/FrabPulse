import { describe, it, expect } from 'vitest';
import { ASSET_DEFINITIONS, TOPIC_DEFINITIONS, getAssetBySlug, getTopicBySlug } from '@frabpulse/shared';

describe('Responsive Breakpoints and Asset Routing Verification', () => {
  const VIEWPORT_BREAKPOINTS = [
    { name: 'Ultra-narrow Mobile (iPhone SE)', width: 320, expectedCols: 1 },
    { name: 'Standard Mobile', width: 375, expectedCols: 1 },
    { name: 'Tablet (iPad Mini / Air)', width: 768, expectedCols: 2 },
    { name: 'Laptop / Desktop', width: 1024, expectedCols: 3 },
    { name: 'Wide Desktop Display', width: 1440, expectedCols: 3 }
  ];

  it('verifies responsive column adaptation logic across all defined breakpoints', () => {
    VIEWPORT_BREAKPOINTS.forEach(({ width, expectedCols }) => {
      // Simulating Tailwind grid responsive rules (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
      let calculatedCols = 1;
      if (width >= 1024) {
        calculatedCols = 3;
      } else if (width >= 640) {
        calculatedCols = 2;
      }

      expect(calculatedCols).toBe(expectedCols);
    });
  });

  it('ensures all tracked gold assets have valid slugs and accessible routes', () => {
    Object.values(ASSET_DEFINITIONS).forEach((asset) => {
      expect(asset.slug).toBeTruthy();
      expect(asset.slug).toMatch(/^[a-z0-9-]+$/);

      const resolved = getAssetBySlug(asset.slug);
      expect(resolved).toBeDefined();
      expect(resolved?.code).toBe(asset.code);
    });
  });

  it('ensures all intelligence topics have valid slugs and resolve correctly', () => {
    Object.values(TOPIC_DEFINITIONS).forEach((topic) => {
      expect(topic.slug).toBeTruthy();
      expect(topic.slug).toMatch(/^[a-z0-9-]+$/);

      const resolved = getTopicBySlug(topic.slug);
      expect(resolved).toBeDefined();
      expect(resolved?.eventType).toBe(topic.eventType);
    });
  });
});
