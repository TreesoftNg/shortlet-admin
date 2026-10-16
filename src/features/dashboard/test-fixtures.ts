import type { ReportsData } from '@/features/reports/types';
import type { DashboardData, KeyPerformanceIndicators, UnitPerformance } from './types';

const IKEJA = { propertyId: 'p1', propertyName: 'Sunmade Ikeja GRA' };
const LEKKI = { propertyId: 'p2', propertyName: 'Sunmade Lekki' };

export function kpis(overrides: Partial<KeyPerformanceIndicators> = {}): KeyPerformanceIndicators {
  return {
    revenue: { value: 900000, previous: 200000, changePercent: 350 },
    bookings: { value: 7, previous: 0, changePercent: null },
    occupancyPercent: { value: 27.6, previous: 30, changePercent: -8 },
    avgNightlyRate: { value: 81818.18, previous: 100000, changePercent: -18.2 },
    ...overrides,
  };
}

export function unitPerformance(overrides: Partial<UnitPerformance> = {}): UnitPerformance {
  return {
    unitId: 'u1',
    unitName: 'Garden Suite',
    unitCode: 'GRA-01',
    ...IKEJA,
    archived: false,
    revenue: 450000,
    bookings: 3,
    nights: 11,
    occupancyPercent: 36.7,
    occupiedNights: 11,
    availableNights: 30,
    avgNightlyRate: 75000,
    ...overrides,
  };
}

/** The business's four units in one property, in the API's order (revenue, then occupancy, then name). */
export function defaultUnits(): UnitPerformance[] {
  return [
    unitPerformance(),
    unitPerformance({
      unitId: 'u2',
      unitName: 'Pool View Studio',
      unitCode: 'GRA-02',
      revenue: 300000,
      bookings: 2,
      nights: 9,
      occupancyPercent: 30,
      occupiedNights: 9,
      availableNights: 30,
      avgNightlyRate: 60000,
    }),
    unitPerformance({
      unitId: 'u3',
      unitName: 'Courtyard Loft',
      unitCode: 'GRA-03',
      revenue: 150000,
      bookings: 2,
      nights: 7,
      occupancyPercent: 24.1,
      occupiedNights: 7,
      availableNights: 29,
      avgNightlyRate: 50000,
    }),
    // Booked through Airbnb only, so there is no price to count.
    unitPerformance({
      unitId: 'u4',
      unitName: 'Penthouse',
      unitCode: 'GRA-04',
      revenue: 0,
      bookings: 0,
      nights: 5,
      occupancyPercent: 18.5,
      occupiedNights: 5,
      availableNights: 27,
      avgNightlyRate: 0,
    }),
  ];
}

/** `count` units in one property, from "Unit 1" (most revenue) down, with occupancy rising the other way. */
export function manyUnits(count: number): UnitPerformance[] {
  return Array.from({ length: count }, (_, index) =>
    unitPerformance({
      unitId: `u${index + 1}`,
      unitName: `Unit ${index + 1}`,
      unitCode: `U-${String(index + 1).padStart(2, '0')}`,
      revenue: (count - index) * 50000,
      bookings: (index % 3) + 1,
      nights: index + 2,
      occupancyPercent: Math.round(((index + 2) / 30) * 1000) / 10,
      occupiedNights: index + 2,
      availableNights: 30,
      avgNightlyRate: 40000 + index * 1000,
    }),
  );
}

/** Two units in each of two properties. */
export function twoPropertyUnits(): UnitPerformance[] {
  return [
    unitPerformance(),
    unitPerformance({
      unitId: 'u5',
      unitName: 'Harbour Suite',
      unitCode: 'LKK-01',
      ...LEKKI,
      revenue: 400000,
      bookings: 2,
      nights: 8,
      occupancyPercent: 26.7,
      occupiedNights: 8,
      availableNights: 30,
      avgNightlyRate: 50000,
    }),
    unitPerformance({
      unitId: 'u2',
      unitName: 'Pool View Studio',
      unitCode: 'GRA-02',
      revenue: 300000,
      bookings: 2,
      nights: 9,
      occupancyPercent: 30,
      occupiedNights: 9,
      availableNights: 30,
      avgNightlyRate: 60000,
    }),
    unitPerformance({
      unitId: 'u6',
      unitName: 'Lagoon Studio',
      unitCode: 'LKK-02',
      ...LEKKI,
      revenue: 100000,
      bookings: 1,
      nights: 2,
      occupancyPercent: 6.7,
      occupiedNights: 2,
      availableNights: 30,
      avgNightlyRate: 50000,
    }),
  ];
}

/** `unitPerformance` with the counts the API sends alongside it. */
export function withUnits(units: UnitPerformance[]): Pick<DashboardData, 'unitPerformance' | 'unitCount' | 'propertyCount'> {
  return {
    unitPerformance: units,
    unitCount: units.length,
    propertyCount: new Set(units.map((unit) => unit.propertyId)).size,
  };
}

/** Reports for a business with two properties, so the property roll-up shows. */
export function twoPropertyReports(): Partial<ReportsData> {
  return {
    ...withUnits(twoPropertyUnits()),
    occupancyByProperty: [
      { ...IKEJA, occupancyPercent: 33.3, occupiedNights: 20, availableNights: 60 },
      { ...LEKKI, occupancyPercent: 16.7, occupiedNights: 10, availableNights: 60 },
    ],
    propertyPerformance: [
      { ...IKEJA, revenue: 750000, bookings: 5, nights: 20, occupancyPercent: 33.3, avgNightlyRate: 68181.82 },
      { ...LEKKI, revenue: 500000, bookings: 3, nights: 10, occupancyPercent: 16.7, avgNightlyRate: 50000 },
    ],
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
    occupancyByProperty: [{ ...IKEJA, occupancyPercent: 27.6, occupiedNights: 32, availableNights: 116 }],
    ...withUnits(defaultUnits()),
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
          unitName: 'Pool View Studio',
          propertyName: IKEJA.propertyName,
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
    unitPerformance: dashboard.unitPerformance,
    unitCount: dashboard.unitCount,
    propertyCount: dashboard.propertyCount,
    otherCurrencies: dashboard.otherCurrencies,
    finance: { grossRevenue: 950000, stayRefunds: 50000, netRevenue: 900000, pendingRefunds: 25000 },
    propertyPerformance: [
      { ...IKEJA, revenue: 900000, bookings: 7, nights: 32, occupancyPercent: 27.6, avgNightlyRate: 81818.18 },
    ],
    channelMix: [
      { channel: 'website', label: 'Website', bookings: 4, nights: 10, revenue: 750000, sharePercent: 57.1 },
      { channel: 'staff', label: 'Booked by staff', bookings: 1, nights: 2, revenue: 150000, sharePercent: 14.3 },
      { channel: 'imported', label: 'Airbnb / Booking.com', bookings: 2, nights: 4, revenue: null, sharePercent: 28.6 },
    ],
    ...overrides,
  };
}
