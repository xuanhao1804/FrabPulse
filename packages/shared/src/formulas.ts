import { GoldGapAnalysis } from './market';

/**
 * 1 Troy Ounce = 31.1034768 grams
 * 1 Vietnamese Tael (Lượng / Cây) = 37.5 grams
 * Conversion ratio: 37.5 / 31.1034768 = 1.205653 troy ounces per tael
 */
export const TROY_OZ_TO_TAEL_FACTOR = 1.20565;

/**
 * Calculate the Vietnam vs World Gold Gap mathematically.
 *
 * @param xauUsd Spot gold price in USD per troy ounce
 * @param usdVnd Exchange rate in VND per USD
 * @param domesticSellPriceVnd Domestic gold sell price in VND per tael
 * @param isDemo Whether this calculation is marked as demo/mock data
 */
export function calculateGoldGap(
  xauUsd: number,
  usdVnd: number,
  domesticSellPriceVnd: number,
  isDemo = false
): GoldGapAnalysis {
  // World gold price converted to VND per tael
  const worldPriceVndPerTael = Math.round(xauUsd * usdVnd * TROY_OZ_TO_TAEL_FACTOR);

  // Absolute difference (premium of domestic over world)
  const gapVnd = domesticSellPriceVnd - worldPriceVndPerTael;

  // Percentage premium
  const gapPercent = Number(((gapVnd / worldPriceVndPerTael) * 100).toFixed(2));

  return {
    worldPriceVndPerTael,
    domesticPriceVndPerTael: domesticSellPriceVnd,
    gapVnd,
    gapPercent,
    xauUsd,
    usdVnd,
    conversionFactor: TROY_OZ_TO_TAEL_FACTOR,
    timestamp: new Date().toISOString(),
    isDemo
  };
}

/**
 * Currency and unit formatters
 */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatVndMillions(amount: number): string {
  const millions = amount / 1_000_000;
  return `${millions.toFixed(2)}M ₫`;
}

export function formatUsd(amount: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
}

export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
