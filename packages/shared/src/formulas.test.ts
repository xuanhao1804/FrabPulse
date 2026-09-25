import { describe, it, expect } from 'vitest';
import { calculateGoldGap, formatVnd, formatUsd, formatPercent, TROY_OZ_TO_TAEL_FACTOR } from './formulas';

describe('Gold Gap Calculation Engine', () => {
  it('correctly calculates the Vietnam vs World gold gap and premium percentage', () => {
    // Example: XAU/USD = $2,650/oz, USD/VND = 25,400, SJC = 88,500,000 VND/tael
    const xauUsd = 2650;
    const usdVnd = 25400;
    const domesticSell = 88_500_000;

    const result = calculateGoldGap(xauUsd, usdVnd, domesticSell);

    // Expected world price per tael = 2650 * 25400 * 1.20565 = ~81,152,301 VND
    const expectedWorldPrice = Math.round(xauUsd * usdVnd * TROY_OZ_TO_TAEL_FACTOR);
    const expectedGap = domesticSell - expectedWorldPrice;
    const expectedPercent = Number(((expectedGap / expectedWorldPrice) * 100).toFixed(2));

    expect(result.worldPriceVndPerTael).toBe(expectedWorldPrice);
    expect(result.gapVnd).toBe(expectedGap);
    expect(result.gapPercent).toBe(expectedPercent);
    expect(result.gapVnd).toBeGreaterThan(0); // Domestic trades at premium
  });

  it('formats currency and percentages properly', () => {
    expect(formatUsd(2650.5)).toContain('$2,650.50');
    expect(formatPercent(1.45)).toBe('+1.45%');
    expect(formatPercent(-0.82)).toBe('-0.82%');
    expect(formatVnd(1000000)).toContain('1.000.000');
  });
});
