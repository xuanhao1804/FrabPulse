import { describe, it, expect } from 'vitest';
import { translations, Locale } from '../src/lib/i18n/translations';

describe('Multi-Language (i18n) Dictionary & Structural Parity', () => {
  const supportedLocales: Locale[] = ['vi', 'en'];

  it('contains valid dictionaries for both Vietnamese (vi) and English (en)', () => {
    expect(translations.vi).toBeDefined();
    expect(translations.en).toBeDefined();
  });

  it('guarantees identical namespace keys between Vietnamese and English', () => {
    const viNamespaces = Object.keys(translations.vi).sort();
    const enNamespaces = Object.keys(translations.en).sort();

    expect(viNamespaces).toEqual(enNamespaces);
  });

  it('guarantees every nested key exists and is a non-empty string in both languages', () => {
    const namespaces = Object.keys(translations.vi) as (keyof typeof translations.vi)[];

    for (const ns of namespaces) {
      const viSection = translations.vi[ns] as Record<string, string>;
      const enSection = translations.en[ns] as Record<string, string>;

      const viKeys = Object.keys(viSection).sort();
      const enKeys = Object.keys(enSection).sort();

      expect(viKeys, `Namespace ${ns} keys mismatch between vi and en`).toEqual(enKeys);

      for (const key of viKeys) {
        expect(viSection[key], `vi.${ns}.${key} should be a non-empty string`).toBeTruthy();
        expect(enSection[key], `en.${ns}.${key} should be a non-empty string`).toBeTruthy();
        expect(typeof viSection[key]).toBe('string');
        expect(typeof enSection[key]).toBe('string');
      }
    }
  });

  it('preserves critical domain invariants in both Vietnamese and English dictionaries', () => {
    // Conversion factor invariant 1.20565
    expect(translations.vi.gapCard.step3).toContain('1.20565');
    expect(translations.en.gapCard.step3).toContain('1.20565');

    // Physical mass conversions
    expect(translations.vi.gapCard.step1).toContain('37.5');
    expect(translations.en.gapCard.step1).toContain('37.5');
    expect(translations.vi.gapCard.step2).toContain('31.1034768');
    expect(translations.en.gapCard.step2).toContain('31.1034768');

    // Decree 24 context
    expect(translations.vi.gapCard.decreeNotice).toContain('24/2012/NĐ-CP');
    expect(translations.en.gapCard.decreeNotice).toContain('24/2012/ND-CP');
  });

  it('properly resolves navigation links and brand branding', () => {
    expect(translations.vi.nav.brand).toBe('FrabPulse');
    expect(translations.en.nav.brand).toBe('FrabPulse');

    expect(translations.vi.nav.radar).toBe('Radar Vàng');
    expect(translations.en.nav.radar).toBe('Gold Radar');

    expect(translations.vi.session.tradingHours).toContain('08:30 - 17:00 ICT');
    expect(translations.en.session.tradingHours).toContain('08:30 - 17:00 ICT');
  });
});
