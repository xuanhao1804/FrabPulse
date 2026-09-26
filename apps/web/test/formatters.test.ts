import { describe, it, expect } from 'vitest';
import {
  formatPriceLocale,
  formatSpreadLocale,
  formatPercentLocale,
  formatNumberLocale
} from '../src/lib/formatters';

describe('Locale-Aware Financial Formatters (vi-VN vs en-US)', () => {
  describe('formatPriceLocale', () => {
    it('formats VND standard price with proper currency sign and separators', () => {
      const price = 89500000;
      const viFormatted = formatPriceLocale(price, 'VND', 'vi', false);
      const enFormatted = formatPriceLocale(price, 'VND', 'en', false);

      // vi: dots or non-breaking spaces for thousands, ends with ₫
      expect(viFormatted).toContain('₫');
      expect(viFormatted.replace(/\s/g, '')).toMatch(/89[.,]500[.,]000₫/);

      // en: commas for thousands, ends with VND
      expect(enFormatted).toBe('89,500,000 VND');
    });

    it('formats VND compact price in millions properly', () => {
      const price = 89500000;
      const viFormatted = formatPriceLocale(price, 'VND', 'vi', true);
      const enFormatted = formatPriceLocale(price, 'VND', 'en', true);

      expect(viFormatted).toBe('89,50 tr.đ');
      expect(enFormatted).toBe('89.50M VND');
    });

    it('formats USD spot gold price with correct decimal and thousand separators', () => {
      const spotGold = 2650.5;
      const viFormatted = formatPriceLocale(spotGold, 'USD', 'vi');
      const enFormatted = formatPriceLocale(spotGold, 'USD', 'en');

      expect(viFormatted).toMatch(/\$2[.,]650,50/);
      expect(enFormatted).toBe('$2,650.50');
    });

    it('gracefully handles NaN inputs', () => {
      expect(formatPriceLocale(NaN, 'VND', 'vi')).toBe('---');
      expect(formatPriceLocale(NaN, 'USD', 'en')).toBe('---');
    });
  });

  describe('formatPercentLocale', () => {
    it('adds plus sign for positive percentages and formats decimals', () => {
      expect(formatPercentLocale(2.45, 'vi')).toBe('+2,45%');
      expect(formatPercentLocale(2.45, 'en')).toBe('+2.45%');
    });

    it('formats negative percentages without double minus', () => {
      expect(formatPercentLocale(-1.3, 'vi')).toBe('-1,30%');
      expect(formatPercentLocale(-1.3, 'en')).toBe('-1.30%');
    });
  });

  describe('formatNumberLocale', () => {
    it('formats numeric weights with locale separators', () => {
      expect(formatNumberLocale(1205.65, 'vi')).toMatch(/1[.,]205,65/);
      expect(formatNumberLocale(1205.65, 'en')).toBe('1,205.65');
    });
  });
});
