import { describe, it, expect } from 'vitest';
import {
  convertGoldWeight,
  estimateGoldValue,
  GRAMS_PER_TAEL,
  GRAMS_PER_CHI,
  GRAMS_PER_TROY_OZ,
  TROY_OZ_TO_TAEL_FACTOR
} from '@frabpulse/shared';

describe('Physical Gold Weight Conversion & Value Estimation', () => {
  describe('convertGoldWeight', () => {
    it('accurately converts 1 Lượng (cây) to all target units', () => {
      const res = convertGoldWeight(1, 'LUONG');
      expect(res.luong).toBe(1);
      expect(res.chi).toBe(10);
      expect(res.grams).toBe(37.5);
      expect(res.kg).toBe(0.0375);
      expect(Number(res.troyOz.toFixed(5))).toBe(1.20565);
    });

    it('accurately converts 1 Chỉ to grams and fractions of lượng', () => {
      const res = convertGoldWeight(1, 'CHI');
      expect(res.chi).toBe(1);
      expect(res.luong).toBe(0.1);
      expect(res.grams).toBe(3.75);
      expect(Number(res.troyOz.toFixed(6))).toBe(0.120565);
    });

    it('accurately converts 1 Troy Ounce to grams and domestic lượng', () => {
      const res = convertGoldWeight(1, 'TROY_OZ');
      expect(res.troyOz).toBe(1);
      expect(res.grams).toBe(31.1034768);
      // 1 troy oz = 31.1034768 / 37.5 lượng = 0.829426...
      expect(Number(res.luong.toFixed(4))).toBe(0.8294);
      expect(Number(res.chi.toFixed(3))).toBe(8.294);
    });

    it('handles 0 and negative inputs safely', () => {
      const zeroRes = convertGoldWeight(0, 'GRAM');
      expect(zeroRes.grams).toBe(0);
      expect(zeroRes.luong).toBe(0);

      const negRes = convertGoldWeight(-5, 'LUONG');
      expect(negRes.grams).toBe(0);
    });
  });

  describe('estimateGoldValue', () => {
    it('computes domestic VND vs converted World USD and VND', () => {
      const weights = convertGoldWeight(1, 'LUONG'); // 1 lượng = 1.20565 oz
      const sjcPrice = 90_000_000; // 90M VND/lượng
      const spotGold = 2500; // $2500/oz
      const usdVnd = 25_000; // 25k VND/USD

      const val = estimateGoldValue(weights, sjcPrice, spotGold, usdVnd);

      expect(val.domesticVnd).toBe(90_000_000);
      // World USD = 1.20565 * 2500 = $3014.13
      expect(val.worldUsd).toBe(3014.13);
      // World VND = 3014.13 * 25000 = 75,353,250 VND
      expect(val.worldVnd).toBe(75_353_250);
      // Arbitrage diff = 90M - 75.35M = ~14.65M VND
      expect(val.arbitrageDiffVnd).toBe(90_000_000 - 75_353_250);
    });
  });
});
