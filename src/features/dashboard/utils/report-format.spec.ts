import {
  axisTicks,
  comparisonLabel,
  formatAmount,
  formatChange,
  formatCompactAmount,
  formatPercent,
  greetingFor,
  periodTitle,
  rangeLabel,
} from './report-format';

describe('report format', () => {
  it('names periods and ranges', () => {
    expect(periodTitle('30d')).toBe('Last 30 days');
    expect(comparisonLabel('12m')).toBe('vs previous 12 months');
    expect(rangeLabel({ startDate: '2026-09-10', endDate: '2026-10-09' })).toBe('10 Sept – 9 Oct 2026');
    expect(rangeLabel({ startDate: '2025-11-01', endDate: '2026-10-09' })).toBe('1 Nov 2025 – 9 Oct 2026');
  });

  it('formats money, percentages and changes', () => {
    expect(formatAmount(1840000, 'NGN')).toBe('₦1,840,000');
    expect(formatCompactAmount(1840000, 'NGN')).toBe('₦1.8M');
    expect(formatPercent(27.6)).toBe('27.6%');
    expect(formatPercent(50)).toBe('50%');
    expect(formatChange(12.5)).toBe('+12.5%');
    expect(formatChange(-8)).toBe('−8%');
    expect(formatChange(0)).toBe('0%');
    expect(formatChange(null)).toBeNull();
  });

  it('greets by the time in Lagos', () => {
    expect(greetingFor(new Date('2026-10-09T07:00:00Z'))).toBe('Good morning'); // 08:00
    expect(greetingFor(new Date('2026-10-09T13:00:00Z'))).toBe('Good afternoon'); // 14:00
    expect(greetingFor(new Date('2026-10-09T19:00:00Z'))).toBe('Good evening'); // 20:00
  });

  it('picks round axis steps', () => {
    expect(axisTicks(900000)).toEqual([0, 500000, 1000000, 1500000]);
    expect(axisTicks(1100)).toEqual([0, 500, 1000, 1500]);
    expect(axisTicks(0)).toEqual([0, 0, 0, 0]);
  });
});
