/** A value on the chart's x axis. */
export type RevenuePoint = { date: string; label: string; amount: number };

export type ChartPadding = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ChartPoint = {
  x: number;
  y: number;
  amount: number;
  label: string;
  date: string;
};

const DEFAULT_PADDING: ChartPadding = {
  top: 24,
  right: 16,
  bottom: 36,
  left: 48,
};

export function getSeriesExtent(points: RevenuePoint[]): { min: number; max: number } {
  if (points.length === 0) {
    return { min: 0, max: 1 };
  }

  const amounts = points.map((point) => point.amount);
  const min = Math.min(...amounts, 0);
  const max = Math.max(...amounts);

  return {
    min,
    max: max === min ? max + 1 : max,
  };
}

export function mapPointsToChart(
  points: RevenuePoint[],
  width: number,
  height: number,
  padding: ChartPadding = DEFAULT_PADDING,
  maxAmount?: number,
): ChartPoint[] {
  if (points.length === 0) return [];

  const { max } = getSeriesExtent(points);
  const ceiling = maxAmount ?? max;
  const plotWidth = Math.max(width - padding.left - padding.right, 1);
  const plotHeight = Math.max(height - padding.top - padding.bottom, 1);
  const denominator = Math.max(points.length - 1, 1);

  return points.map((point, index) => {
    const ratio = point.amount / ceiling;
    return {
      x: padding.left + (index / denominator) * plotWidth,
      y: padding.top + (1 - ratio) * plotHeight,
      amount: point.amount,
      label: point.label,
      date: point.date,
    };
  });
}

/** Smooth cubic path through chart points (Catmull-Rom → Bezier). */
export function buildSmoothLinePath(points: ChartPoint[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;

    // Control points stay between the two ends, so the curve never dips
    // below zero or overshoots a peak.
    const low = Math.min(p1.y, p2.y);
    const high = Math.max(p1.y, p2.y);
    const clamp = (y: number) => Math.min(high, Math.max(low, y));
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clamp(p1.y + (p2.y - p0.y) / 6);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clamp(p2.y - (p3.y - p1.y) / 6);

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export function buildAreaPath(
  points: ChartPoint[],
  height: number,
  padding: ChartPadding = DEFAULT_PADDING,
): string {
  const line = buildSmoothLinePath(points);
  if (!line || points.length === 0) return '';

  const baseline = height - padding.bottom;
  const first = points[0];
  const last = points[points.length - 1];

  return `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

export const chartPadding = DEFAULT_PADDING;
