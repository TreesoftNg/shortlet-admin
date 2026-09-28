import {
  formatChannelLabel,
  formatOccupancy,
  formatShare,
  getFinanceCards,
  getPropertyPerformanceTotals,
  getSliceForPeriod,
} from './report-formatters';
import { mockReportsSummary } from '@/mocks/data/reports';

describe('report-formatters', () => {
  const slice = mockReportsSummary.by_period['30d'];

  it('formats occupancy and share', () => {
    expect(formatOccupancy(78)).toBe('78%');
    expect(formatShare(61)).toBe('61%');
  });

  it('labels channels', () => {
    expect(formatChannelLabel('direct')).toBe('Direct');
    expect(formatChannelLabel('airbnb')).toBe('Airbnb');
  });

  it('sums property performance', () => {
    const totals = getPropertyPerformanceTotals(slice.property_performance);
    expect(totals.bookings).toBeGreaterThan(0);
    expect(totals.revenue).toBeGreaterThan(0);
  });

  it('builds finance cards', () => {
    const cards = getFinanceCards(slice.finance);
    expect(cards.map((item) => item.id)).toEqual([
      'gross',
      'refunds',
      'net',
      'pending',
    ]);
    expect(cards[2].label).toBe('Net revenue');
  });

  it('resolves period slices', () => {
    expect(getSliceForPeriod(mockReportsSummary.by_period, '7d')).not.toBeNull();
    expect(getSliceForPeriod(mockReportsSummary.by_period, 'bad')).toBeNull();
  });
});
