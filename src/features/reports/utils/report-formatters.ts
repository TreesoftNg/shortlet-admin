import { formatAmount } from '@/features/dashboard/utils/report-format';
import type { FinanceSummary, PropertyPerformance } from '../types';

export function getPropertyPerformanceTotals(
  rows: PropertyPerformance[],
): Pick<PropertyPerformance, 'revenue' | 'bookings' | 'nights'> {
  return rows.reduce(
    (totals, row) => ({
      revenue: totals.revenue + row.revenue,
      bookings: totals.bookings + row.bookings,
      nights: totals.nights + row.nights,
    }),
    { revenue: 0, bookings: 0, nights: 0 },
  );
}

export function getFinanceRows(finance: FinanceSummary, currency: string) {
  return [
    { id: 'gross', label: 'Gross revenue', hint: 'Stay value of nights in the period', value: formatAmount(finance.grossRevenue, currency) },
    { id: 'refunds', label: 'Stay refunds', hint: 'Refunded on those nights', value: formatAmount(finance.stayRefunds, currency) },
    { id: 'net', label: 'Net revenue', hint: 'Gross minus stay refunds', value: formatAmount(finance.netRevenue, currency), emphasize: true },
    { id: 'pending', label: 'Pending refunds', hint: 'Waiting at Flutterwave right now', value: formatAmount(finance.pendingRefunds, currency) },
  ] as const;
}
