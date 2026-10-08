'use client';

import { Grid } from '@chakra-ui/react';
import { LuCalendarCheck, LuPercent, LuTag, LuWallet } from 'react-icons/lu';
import { KpiCard } from '@/shared/components/ui';
import type { KeyPerformanceIndicators, KpiValue, ReportPeriod } from '../types';
import { comparisonLabel, formatAmount, formatChange, formatPercent } from '../utils/report-format';

const trendOf = (kpi: KpiValue) =>
  kpi.changePercent === null || kpi.changePercent === 0 ? 'flat' : kpi.changePercent > 0 ? 'up' : 'down';

/** Revenue, bookings, occupancy and nightly rate, each against the previous period. */
export function KpiGrid({
  kpis,
  currency,
  period,
}: {
  kpis: KeyPerformanceIndicators;
  currency: string;
  period: ReportPeriod;
}) {
  const caption = comparisonLabel(period);
  const cards = [
    { key: 'revenue', label: 'Revenue', kpi: kpis.revenue, value: formatAmount(kpis.revenue.value, currency), icon: <LuWallet size={18} /> },
    { key: 'bookings', label: 'Bookings', kpi: kpis.bookings, value: String(kpis.bookings.value), icon: <LuCalendarCheck size={18} /> },
    {
      key: 'occupancy',
      label: 'Occupancy',
      kpi: kpis.occupancyPercent,
      value: formatPercent(kpis.occupancyPercent.value),
      icon: <LuPercent size={18} />,
    },
    {
      key: 'adr',
      label: 'Avg nightly rate',
      kpi: kpis.avgNightlyRate,
      value: formatAmount(kpis.avgNightlyRate.value, currency),
      icon: <LuTag size={18} />,
    },
  ] as const;

  return (
    <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={{ base: '12px', md: '18px' }}>
      {cards.map((card) => (
        <KpiCard
          key={card.key}
          label={card.label}
          value={card.value}
          icon={card.icon}
          change={formatChange(card.kpi.changePercent)}
          trend={trendOf(card.kpi)}
          caption={caption}
        />
      ))}
    </Grid>
  );
}
