import { mockDashboardSummary } from '@/mocks/data';
import type {
  ReportsPeriodSlice,
  ReportsSummary,
  RevenuePeriod,
} from '@/shared/types/hospitable';

function scaleKpiValue(value: number, factor: number): number {
  return Math.round(value * factor);
}

function buildPeriodSlice(
  factor: number,
  periodLabel: string,
): ReportsPeriodSlice {
  const base = mockDashboardSummary;
  const occupancy = base.occupancy_by_property.map((item) => ({
    ...item,
    occupancy_percent: Math.min(
      98,
      Math.max(35, Math.round(item.occupancy_percent * factor)),
    ),
  }));

  const propertyPerformance = [
    {
      property_id: 'prop-azure',
      property_name: 'Azure Lekki',
      revenue: scaleKpiValue(7200000, factor),
      currency: 'NGN',
      bookings: scaleKpiValue(48, factor),
      occupancy_percent: occupancy[0].occupancy_percent,
      avg_nightly_rate: 95000,
      nights_booked: scaleKpiValue(156, factor),
    },
    {
      property_id: 'prop-palms',
      property_name: 'The Palms VI',
      revenue: scaleKpiValue(5100000, factor),
      currency: 'NGN',
      bookings: scaleKpiValue(42, factor),
      occupancy_percent: occupancy[1].occupancy_percent,
      avg_nightly_rate: 78000,
      nights_booked: scaleKpiValue(128, factor),
    },
    {
      property_id: 'prop-maitama',
      property_name: 'Maitama Abuja',
      revenue: scaleKpiValue(3800000, factor),
      currency: 'NGN',
      bookings: scaleKpiValue(31, factor),
      occupancy_percent: occupancy[2].occupancy_percent,
      avg_nightly_rate: 88000,
      nights_booked: scaleKpiValue(94, factor),
    },
    {
      property_id: 'prop-ikoyi',
      property_name: 'Ikoyi PH',
      revenue: scaleKpiValue(2300000, factor),
      currency: 'NGN',
      bookings: scaleKpiValue(21, factor),
      occupancy_percent: occupancy[3].occupancy_percent,
      avg_nightly_rate: 110000,
      nights_booked: scaleKpiValue(62, factor),
    },
  ];

  const gross = propertyPerformance.reduce((sum, row) => sum + row.revenue, 0);
  const refunds = scaleKpiValue(420000, factor);
  const pending = scaleKpiValue(50000, factor);

  return {
    period_label: periodLabel,
    kpis: base.kpis.map((kpi) => {
      if (kpi.key === 'revenue') {
        const value = scaleKpiValue(kpi.value, factor);
        return {
          ...kpi,
          value,
          formatted_value: `₦${(value / 1_000_000).toFixed(1)}M`,
          delta_percent: Number((kpi.delta_percent * factor).toFixed(1)),
        };
      }
      if (kpi.key === 'bookings') {
        const value = scaleKpiValue(kpi.value, factor);
        return {
          ...kpi,
          value,
          formatted_value: String(value),
          delta_percent: Number((kpi.delta_percent * factor).toFixed(1)),
        };
      }
      if (kpi.key === 'occupancy') {
        const value = Math.min(
          95,
          Math.max(40, Math.round(kpi.value * factor)),
        );
        return {
          ...kpi,
          value,
          formatted_value: `${value}%`,
        };
      }
      return kpi;
    }),
    occupancy_avg_percent: Math.min(
      95,
      Math.max(40, Math.round(base.occupancy_avg_percent * factor)),
    ),
    occupancy_by_property: occupancy,
    property_performance: propertyPerformance,
    channel_breakdown: [
      {
        channel: 'direct',
        bookings: scaleKpiValue(98, factor),
        revenue: scaleKpiValue(11200000, factor),
        currency: 'NGN',
        share_percent: 61,
      },
      {
        channel: 'airbnb',
        bookings: scaleKpiValue(44, factor),
        revenue: scaleKpiValue(7200000, factor),
        currency: 'NGN',
        share_percent: 39,
      },
    ],
    finance: {
      gross_revenue: gross,
      refunds_issued: refunds,
      net_revenue: gross - refunds,
      pending_refunds: pending,
      currency: 'NGN',
    },
  };
}

const PERIOD_FACTORS: Record<RevenuePeriod, { factor: number; label: string }> =
  {
    '7d': { factor: 0.28, label: 'Last 7 days' },
    '30d': { factor: 1, label: 'Last 30 days' },
    '90d': { factor: 2.6, label: 'Last 90 days' },
    '12m': { factor: 9.4, label: 'Last 12 months' },
  };

export const mockReportsSummary: ReportsSummary = {
  revenue_overview: mockDashboardSummary.revenue_overview,
  by_period: {
    '7d': buildPeriodSlice(
      PERIOD_FACTORS['7d'].factor,
      PERIOD_FACTORS['7d'].label,
    ),
    '30d': buildPeriodSlice(
      PERIOD_FACTORS['30d'].factor,
      PERIOD_FACTORS['30d'].label,
    ),
    '90d': buildPeriodSlice(
      PERIOD_FACTORS['90d'].factor,
      PERIOD_FACTORS['90d'].label,
    ),
    '12m': buildPeriodSlice(
      PERIOD_FACTORS['12m'].factor,
      PERIOD_FACTORS['12m'].label,
    ),
  },
};
