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

/**
 * Physical Gold Weight Constants
 */
export const GRAMS_PER_TAEL = 37.5;
export const GRAMS_PER_CHI = 3.75;
export const GRAMS_PER_TROY_OZ = 31.1034768;

export type GoldUnit = 'LUONG' | 'CHI' | 'TROY_OZ' | 'GRAM' | 'KG';

export interface ConvertedGoldWeights {
  luong: number;
  chi: number;
  troyOz: number;
  grams: number;
  kg: number;
}

export function convertGoldWeight(amount: number, fromUnit: GoldUnit): ConvertedGoldWeights {
  if (isNaN(amount) || amount <= 0) {
    return { luong: 0, chi: 0, troyOz: 0, grams: 0, kg: 0 };
  }

  // Convert input to baseline grams first
  let grams = 0;
  switch (fromUnit) {
    case 'LUONG':
      grams = amount * GRAMS_PER_TAEL;
      break;
    case 'CHI':
      grams = amount * GRAMS_PER_CHI;
      break;
    case 'TROY_OZ':
      grams = amount * GRAMS_PER_TROY_OZ;
      break;
    case 'GRAM':
      grams = amount;
      break;
    case 'KG':
      grams = amount * 1000;
      break;
  }

  return {
    grams,
    kg: grams / 1000,
    luong: grams / GRAMS_PER_TAEL,
    chi: grams / GRAMS_PER_CHI,
    troyOz: grams / GRAMS_PER_TROY_OZ
  };
}

export interface EstimatedGoldValues {
  domesticVnd: number;
  worldVnd: number;
  worldUsd: number;
  arbitrageDiffVnd: number;
}

export function estimateGoldValue(
  weights: ConvertedGoldWeights,
  sjcPricePerLuong: number,
  spotGoldUsdPerOz: number,
  usdVnd: number
): EstimatedGoldValues {
  const domesticVnd = Math.round(weights.luong * sjcPricePerLuong);
  const worldUsd = Number((weights.troyOz * spotGoldUsdPerOz).toFixed(2));
  const worldVnd = Math.round(worldUsd * usdVnd);
  const arbitrageDiffVnd = domesticVnd - worldVnd;

  return {
    domesticVnd,
    worldVnd,
    worldUsd,
    arbitrageDiffVnd
  };
}

