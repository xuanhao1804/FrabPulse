import { describe, it, expect } from 'vitest';

describe('Chart Continuous Sub-Pixel Interpolation Math', () => {
  it('correctly calculates continuous price interpolation between adjacent ticks', () => {
    const p1 = 2650.0;
    const p2 = 2660.0;

    // Linear interpolation formula: P(t) = P1 + t * (P2 - P1)
    const interpHalf = p1 + 0.5 * (p2 - p1);
    expect(interpHalf).toBe(2655.0);

    const interpQuarter = p1 + 0.25 * (p2 - p1);
    expect(interpQuarter).toBe(2652.5);

    const interpThreeQuarter = p1 + 0.75 * (p2 - p1);
    expect(interpThreeQuarter).toBe(2657.5);
  });

  it('smoothly maps continuous sub-pixel mouse coordinate to relative progress without stepping', () => {
    const leftMargin = 16;
    const plotWidth = 820;

    const computeRelX = (svgMouseX: number) => {
      const clampedSvgX = Math.max(leftMargin, Math.min(leftMargin + plotWidth, svgMouseX));
      return (clampedSvgX - leftMargin) / plotWidth;
    };

    expect(computeRelX(16)).toBe(0);
    expect(computeRelX(836)).toBe(1);
    expect(computeRelX(426)).toBeCloseTo(0.5, 4);

    // Verify sub-pixel 1-pixel mousemove step produces continuous float increment
    const rel1 = computeRelX(200);
    const rel2 = computeRelX(201);
    expect(rel2 - rel1).toBeCloseTo(1 / plotWidth, 5);
    expect(rel2).toBeGreaterThan(rel1);
  });

  it('accurately interpolates timestamp at continuous intermediate cursor positions', () => {
    const t1 = new Date('2026-09-26T10:00:00.000Z').getTime();
    const t2 = new Date('2026-09-26T10:12:00.000Z').getTime(); // 12 minutes later

    const t = 0.5;
    const interpTimestamp = new Date(t1 + t * (t2 - t1)).toISOString();
    expect(interpTimestamp).toBe('2026-09-26T10:06:00.000Z');
  });

  it('smoothly scales cubic spline control points without NaN or infinite values', () => {
    const samplePoints = [
      { x: 16, y: 100 },
      { x: 100, y: 150 },
      { x: 200, y: 80 },
      { x: 300, y: 120 }
    ];

    for (let i = 0; i < samplePoints.length - 1; i++) {
      const p0 = samplePoints[i === 0 ? 0 : i - 1];
      const p1 = samplePoints[i];
      const p2 = samplePoints[i + 1];
      const p3 = samplePoints[i + 2 < samplePoints.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      expect(Number.isFinite(cp1x)).toBe(true);
      expect(Number.isFinite(cp1y)).toBe(true);
      expect(Number.isFinite(cp2x)).toBe(true);
      expect(Number.isFinite(cp2y)).toBe(true);
    }
  });
});
