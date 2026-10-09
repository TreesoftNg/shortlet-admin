import {
  type RevenuePoint,
  buildAreaPath,
  buildSmoothLinePath,
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


  it('keeps the curve between neighbouring points (no dip below zero)', () => {
    const points = mapPointsToChart(
      [
        { date: 'a', label: 'a', amount: 0 },
        { date: 'b', label: 'b', amount: 0 },
        { date: 'c', label: 'c', amount: 100 },
        { date: 'd', label: 'd', amount: 0 },
      ],
      400,
      200,
    );
    const baseline = Math.max(...points.map((point) => point.y));
    const ys = buildSmoothLinePath(points)
      .match(/-?\d+(\.\d+)?/g)!
      .map(Number)
      .filter((_, index) => index % 2 === 1);
    expect(Math.max(...ys)).toBeLessThanOrEqual(baseline);
  });
});
