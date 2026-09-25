import { describe, it, expect } from 'vitest';
import { CorrelationEngineService } from '../src/modules/events/services/correlation-engine.service';

describe('CorrelationEngineService', () => {
  const service = new CorrelationEngineService();

  it('measures factual price movement and attaches scientific correlation caveats', () => {
    const happenedAt = new Date('2026-09-24T18:00:00Z');
    const result = service.measureCorrelation(
      'XAU_USD',
      2668.40,
      2649.20,
      happenedAt,
      30
    );

    expect(result.assetCode).toBe('XAU_USD');
    expect(result.deltaAbsolute).toBe(-19.20);
    expect(result.deltaPercent).toBe(-0.72);
    expect(result.isStatisticallySignificant).toBe(true);
    expect(result.correlationCaveat).toContain('associated movement, not unilateral single-factor causation');
  });

  it('marks sub-threshold movements as not statistically significant', () => {
    const happenedAt = new Date('2026-09-24T18:00:00Z');
    const result = service.measureCorrelation(
      'USD_VND',
      25400,
      25410,
      happenedAt,
      30
    );

    expect(result.deltaPercent).toBe(0.04);
    expect(result.isStatisticallySignificant).toBe(false);
  });
});
