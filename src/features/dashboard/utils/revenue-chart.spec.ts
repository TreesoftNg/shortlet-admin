import type { RevenuePoint } from '@/shared/types/hospitable';
import {
  buildAreaPath,
  buildSmoothLinePath,
  findHighlightIndex,
  getSeriesExtent,
  mapPointsToChart,
} from './revenue-chart';

const sample: RevenuePoint[] = [
  { date: '2026-08-28', label: 'Aug 28', amount: 320000 },
  { date: '2026-09-04', label: 'Sep 4', amount: 560000 },
  { date: '2026-09-18', label: 'Sep 18', amount: 842500 },
  { date: '2026-09-25', label: 'Sep 25', amount: 910000 },
];

describe('revenue-chart utils', () => {
  it('computes series extent including zero floor', () => {
    expect(getSeriesExtent(sample)).toEqual({ min: 0, max: 910000 });
  });

  it('maps points into chart coordinates', () => {
    const points = mapPointsToChart(sample, 720, 260);
    expect(points).toHaveLength(4);
    expect(points[0].x).toBeLessThan(points[3].x);
    expect(points[3].y).toBeLessThan(points[0].y);
  });

  it('builds a smooth line path', () => {
    const points = mapPointsToChart(sample, 720, 260);
    const path = buildSmoothLinePath(points);
    expect(path.startsWith('M ')).toBe(true);
    expect(path).toContain(' C ');
  });

  it('builds a closed area path', () => {
    const points = mapPointsToChart(sample, 720, 260);
    const path = buildAreaPath(points, 260);
    expect(path.endsWith(' Z')).toBe(true);
  });

  it('finds highlight index by date', () => {
    expect(findHighlightIndex(sample, '2026-09-18')).toBe(2);
    expect(findHighlightIndex(sample, 'missing')).toBe(3);
  });
});
