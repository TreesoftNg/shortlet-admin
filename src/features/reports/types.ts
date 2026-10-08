import type {
  KeyPerformanceIndicators,
  OtherCurrencyRevenue,
  PropertyOccupancy,
  ReportPeriod,
  ReportRange,
  RevenuePoint,
  UnitOccupancy,
} from '@/features/dashboard/types';

export type FinanceSummary = {
  grossRevenue: number;
  stayRefunds: number;
  netRevenue: number;
  /** Waiting at Flutterwave right now, not limited to the period. */
  pendingRefunds: number;
};

export type PropertyPerformance = {
  propertyId: string | null;
  propertyName: string;
  revenue: number;
  bookings: number;
  nights: number;
  occupancyPercent: number;
  avgNightlyRate: number;
};

export type ChannelMix = {
  channel: 'website' | 'staff' | 'imported';
  label: string;
  bookings: number;
  nights: number;
  /** Null for Airbnb / Booking.com stays: Hospitable sends no prices. */
  revenue: number | null;
  sharePercent: number;
};

/** GET /cc/reports */
export type ReportsData = {
  currency: string;
  period: ReportPeriod;
  range: ReportRange;
  previousRange: ReportRange;
  keyPerformanceIndicators: KeyPerformanceIndicators;
  revenueOverview: RevenuePoint[];
  finance: FinanceSummary;
  occupancyByUnit: UnitOccupancy[];
  occupancyByProperty: PropertyOccupancy[];
  propertyPerformance: PropertyPerformance[];
  channelMix: ChannelMix[];
  otherCurrencies: OtherCurrencyRevenue[];
};
