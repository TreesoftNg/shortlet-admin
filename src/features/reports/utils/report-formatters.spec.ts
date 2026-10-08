import { getFinanceRows, getPropertyPerformanceTotals } from './report-formatters';

describe('report formatters', () => {
  it('adds up property rows', () => {
    expect(
      getPropertyPerformanceTotals([
        { propertyId: 'a', propertyName: 'A', revenue: 100, bookings: 2, nights: 5, occupancyPercent: 10, avgNightlyRate: 20 },
        { propertyId: 'b', propertyName: 'B', revenue: 50, bookings: 1, nights: 3, occupancyPercent: 5, avgNightlyRate: 17 },
      ]),
    ).toEqual({ revenue: 150, bookings: 3, nights: 8 });
  });

  it('formats the finance summary in the business currency', () => {
    const rows = getFinanceRows({ grossRevenue: 950000, stayRefunds: 50000, netRevenue: 900000, pendingRefunds: 0 }, 'NGN');
    expect(rows.map((row) => [row.label, row.value])).toEqual([
      ['Gross revenue', '₦950,000'],
      ['Stay refunds', '₦50,000'],
      ['Net revenue', '₦900,000'],
      ['Pending refunds', '₦0'],
    ]);
  });
});
