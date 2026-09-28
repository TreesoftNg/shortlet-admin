import { formatMoney } from '@/features/bookings/utils/reservation-display';
import type {
  ChannelBreakdownRow,
  PropertyPerformanceRow,
  ReportsFinanceSummary,
  ReportsPeriodSlice,
} from '@/shared/types/hospitable';

export function formatShare(percent: number): string {
  return `${percent}%`;
}

export function formatOccupancy(percent: number): string {
  return `${percent}%`;
}

export function getPropertyPerformanceTotals(
  rows: PropertyPerformanceRow[],
): Pick<
  PropertyPerformanceRow,
  'revenue' | 'bookings' | 'nights_booked'
> {
  return rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      bookings: acc.bookings + row.bookings,
      nights_booked: acc.nights_booked + row.nights_booked,
    }),
    { revenue: 0, bookings: 0, nights_booked: 0 },
  );
}

export function formatChannelLabel(channel: ChannelBreakdownRow['channel']): string {
  if (channel === 'direct') return 'Direct';
  if (channel === 'airbnb') return 'Airbnb';
  return channel;
}

export function getFinanceCards(finance: ReportsFinanceSummary) {
  return [
    {
      id: 'gross',
      label: 'Gross revenue',
      value: formatMoney(finance.gross_revenue, finance.currency),
    },
    {
      id: 'refunds',
      label: 'Refunds issued',
      value: formatMoney(finance.refunds_issued, finance.currency),
    },
    {
      id: 'net',
      label: 'Net revenue',
      value: formatMoney(finance.net_revenue, finance.currency),
    },
    {
      id: 'pending',
      label: 'Pending refunds',
      value: formatMoney(finance.pending_refunds, finance.currency),
    },
  ] as const;
}

export function getSliceForPeriod(
  byPeriod: Record<string, ReportsPeriodSlice>,
  period: string,
): ReportsPeriodSlice | null {
  return byPeriod[period] ?? null;
}
