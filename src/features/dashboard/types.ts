/** GET /cc/dashboard and /cc/reports: the period every figure covers. */
export type ReportPeriod = '7d' | '30d' | '90d' | '12m';

export type ReportRange = { startDate: string; endDate: string };

export type KpiValue = {
  value: number;
  /** Same figure for the previous period. */
  previous: number;
  /** Null when the previous value was 0. */
  changePercent: number | null;
};

export type KeyPerformanceIndicators = {
  revenue: KpiValue;
  bookings: KpiValue;
  occupancyPercent: KpiValue;
  avgNightlyRate: KpiValue;
};

export type RevenuePoint = {
  date: string;
  label: string;
  amount: number;
  previousAmount: number;
};

export type UnitOccupancy = {
  unitId: string;
  unitName: string;
  propertyId: string | null;
  propertyName: string | null;
  occupancyPercent: number;
  occupiedNights: number;
  availableNights: number;
};

export type PropertyOccupancy = {
  propertyId: string | null;
  propertyName: string;
  occupancyPercent: number;
  occupiedNights: number;
  availableNights: number;
};

export type OtherCurrencyRevenue = { currency: string; revenue: number; bookings: number };

export type TodayMovement = {
  bookingId: string | null;
  reference: string | null;
  source: 'website' | 'staff' | 'imported';
  guestName: string;
  unitId: string;
  unitName: string;
  propertyName: string | null;
  time: string;
};

export type DashboardData = {
  currency: string;
  period: ReportPeriod;
  range: ReportRange;
  previousRange: ReportRange;
  keyPerformanceIndicators: KeyPerformanceIndicators;
  revenueOverview: RevenuePoint[];
  occupancyByUnit: UnitOccupancy[];
  occupancyByProperty: PropertyOccupancy[];
  otherCurrencies: OtherCurrencyRevenue[];
  today: { date: string; checkIns: TodayMovement[]; checkOuts: TodayMovement[] };
};
