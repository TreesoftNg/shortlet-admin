import type { ReportPeriod, ReportRange } from '../types';

export const PERIOD_OPTIONS: Array<{ value: ReportPeriod; label: string }> = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
];

const PERIOD_NAMES: Record<ReportPeriod, string> = {
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
  '12m': '12 months',
};

/** "Last 30 days" */
export function periodTitle(period: ReportPeriod): string {
  return `Last ${PERIOD_NAMES[period]}`;
}

/** "vs previous 30 days" */
export function comparisonLabel(period: ReportPeriod): string {
  return `vs previous ${PERIOD_NAMES[period]}`;
}

const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const dayYearFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "10 Sep – 9 Oct 2026" */
export function rangeLabel(range: ReportRange): string {
  const start = new Date(`${range.startDate}T00:00:00Z`);
  const end = new Date(`${range.endDate}T00:00:00Z`);
  const startText =
    start.getUTCFullYear() === end.getUTCFullYear() ? dayFormat.format(start) : dayYearFormat.format(start);
  return `${startText} – ${dayYearFormat.format(end)}`;
}

/** ₦1,840,000 */
export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

/** ₦1.8M, for chart axes. */
export function formatCompactAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

/** 27.6% */
export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(value)}%`;
}

/** "+12.5%", "−8%", or null when there is nothing to compare with. */
export function formatChange(changePercent: number | null): string | null {
  if (changePercent === null) return null;
  const size = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 1 }).format(Math.abs(changePercent));
  if (changePercent > 0) return `+${size}%`;
  if (changePercent < 0) return `−${size}%`;
  return '0%';
}

/** Good morning / afternoon / evening, by the time in Lagos. */
export function greetingFor(now: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Africa/Lagos' }).format(now),
  );
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Four evenly spaced axis values from 0 to a round number at or above `max`. */
export function axisTicks(max: number): number[] {
  if (max <= 0) return [0, 0, 0, 0];
  const rough = max / 3;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((factor) => factor * magnitude).find((candidate) => candidate >= rough) ?? rough;
  return [0, step, step * 2, step * 3];
}

/** Colours for properties in occupancy lists, in order. */
export const PROPERTY_COLORS = ['#10695B', '#3AAF96', '#F59E0B', '#6366F1', '#EC4899', '#0EA5E9', '#84CC16', '#A855F7'];
