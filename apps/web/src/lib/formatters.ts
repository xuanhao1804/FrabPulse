import { Locale } from './i18n/translations';

/**
 * Locale-aware financial number and currency formatters for FrabPulse.
 * Ensures proper thousand and decimal separators across Vietnamese (vi-VN)
 * and International English (en-US) standards.
 */

export function formatPriceLocale(
  amount: number,
  currency: 'VND' | 'USD',
  locale: Locale,
  compact: boolean = false
): string {
  if (isNaN(amount)) return '---';

  if (currency === 'VND') {
    if (compact) {
      const inMillions = amount / 1_000_000;
      if (locale === 'vi') {
        return `${inMillions.toLocaleString('vi-VN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} tr.đ`;
      }
      return `${inMillions.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}M VND`;
    }

    if (locale === 'vi') {
      return `${amount.toLocaleString('vi-VN')} ₫`;
    }
    return `${amount.toLocaleString('en-US')} VND`;
  }

  // USD
  if (locale === 'vi') {
    return `$${amount.toLocaleString('vi-VN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export function formatSpreadLocale(
  spread: number,
  currency: 'VND' | 'USD',
  locale: Locale,
  isDomesticGold: boolean = false
): string {
  if (isDomesticGold && currency === 'VND') {
    return formatPriceLocale(spread, 'VND', locale, true);
  }
  return formatPriceLocale(spread, currency, locale, false);
}

export function formatPercentLocale(percent: number, locale: Locale): string {
  if (isNaN(percent)) return '---';
  const prefix = percent > 0 ? '+' : '';
  const numStr = percent.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${prefix}${numStr}%`;
}

export function formatNumberLocale(val: number, locale: Locale, maxDecimals: number = 2): string {
  if (isNaN(val)) return '---';
  return val.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    maximumFractionDigits: maxDecimals
  });
}
