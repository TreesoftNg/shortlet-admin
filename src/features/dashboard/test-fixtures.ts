import type { ReportsData } from '@/features/reports/types';
import type { DashboardData, KeyPerformanceIndicators } from './types';

export function kpis(overrides: Partial<KeyPerformanceIndicators> = {}): KeyPerformanceIndicators {
  return {
    revenue: { value: 900000, previous: 200000, changePercent: 350 },
    bookings: { value: 7, previous: 0, changePercent: null },
    occupancyPercent: { value: 27.6, previous: 30, changePercent: -8 },
    avgNightlyRate: { value: 81818.18, previous: 100000, changePercent: -18.2 },
    ...overrides,
  };
}

export function dashboardData(overrides: Partial<DashboardData> = {}): DashboardData {
  return {
    currency: 'NGN',
    period: '30d',
    range: { startDate: '2026-09-10', endDate: '2026-10-09' },
    previousRange: { startDate: '2026-08-11', endDate: '2026-09-09' },
    keyPerformanceIndicators: kpis(),
    revenueOverview: [
      { date: '2026-10-07', label: '7 Oct', amount: 100000, previousAmount: 0 },
      { date: '2026-10-08', label: '8 Oct', amount: 250000, previousAmount: 50000 },
      { date: '2026-10-09', label: '9 Oct', amount: 0, previousAmount: 0 },
    ],
    occupancyByUnit: [],
    occupancyByProperty: [
      { propertyId: 'p1', propertyName: 'Ikeja', occupancyPercent: 28.6, occupiedNights: 8, availableNights: 28 },
      { propertyId: 'p2', propertyName: 'Lekki', occupancyPercent: 26.7, occupiedNights: 8, availableNights: 30 },
    ],
    otherCurrencies: [],
    today: {
      date: '2026-10-09',
      checkIns: [
        {
          bookingId: null,
          reference: 'HMABC',
          source: 'imported',
          guestName: 'Arriving Airbnb Guest',
          unitId: 'u2',
          unitName: 'Unit B',
          propertyName: 'Ikeja',
          time: '15:00',
        },
      ],
      checkOuts: [],
    },
    ...overrides,
  };
}

export function reportsData(overrides: Partial<ReportsData> = {}): ReportsData {
  const dashboard = dashboardData();
  return {
    currency: dashboard.currency,
    period: dashboard.period,
    range: dashboard.range,
    previousRange: dashboard.previousRange,
    keyPerformanceIndicators: dashboard.keyPerformanceIndicators,
    revenueOverview: dashboard.revenueOverview,
    occupancyByUnit: dashboard.occupancyByUnit,
    occupancyByProperty: dashboard.occupancyByProperty,
    otherCurrencies: dashboard.otherCurrencies,
    finance: { grossRevenue: 950000, stayRefunds: 50000, netRevenue: 900000, pendingRefunds: 25000 },
    propertyPerformance: [
      { propertyId: 'p2', propertyName: 'Lekki', revenue: 750000, bookings: 3, nights: 8, occupancyPercent: 26.7, avgNightlyRate: 93750 },
      { propertyId: 'p1', propertyName: 'Ikeja', revenue: 150000, bookings: 4, nights: 8, occupancyPercent: 28.6, avgNightlyRate: 50000 },
    ],
    channelMix: [
      { channel: 'website', label: 'Website', bookings: 4, nights: 10, revenue: 750000, sharePercent: 57.1 },
      { channel: 'staff', label: 'Booked by staff', bookings: 1, nights: 2, revenue: 150000, sharePercent: 14.3 },
      { channel: 'imported', label: 'Airbnb / Booking.com', bookings: 2, nights: 4, revenue: null, sharePercent: 28.6 },
    ],
    ...overrides,
  };
}
