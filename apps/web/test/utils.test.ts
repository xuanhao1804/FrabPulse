import { describe, it, expect } from 'vitest';
import { cn, formatTimeAgo } from '../src/lib/utils';

describe('Web Utilities', () => {
  it('merges class names correctly with tailwind-merge', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('formats time ago timestamps accurately', () => {
    const now = new Date().toISOString();
    expect(formatTimeAgo(now)).toBe('Just now');

    const tenMinsAgo = new Date(Date.now() - 10 * 60000).toISOString();
    expect(formatTimeAgo(tenMinsAgo)).toBe('10m ago');

    const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
  });
});
