'use client';

import {
  Box,
  Flex,
  Grid,
  IconButton,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import {
  LuCalendarCheck,
  LuMenu,
  LuPercent,
  LuTag,
  LuWallet,
} from 'react-icons/lu';
import type { ReactElement } from 'react';
import { PeriodSegment } from '@/features/dashboard/components/period-segment';
import { RevenueOverview } from '@/features/dashboard/components/revenue-overview';
import { ChannelBreakdownPanel } from '@/features/reports/components/channel-breakdown-panel';
import { PropertyPerformanceTable } from '@/features/reports/components/property-performance-table';
import { ReportsSidePanel } from '@/features/reports/components/reports-side-panel';
import { useReports } from '@/features/reports/hooks/use-reports';
import { reportPropertyExportColumns } from '@/features/reports/utils/report-export';
import {
  ErrorState,
  ExportButton,
  KpiCard,
  PageHeader,
  PageSkeleton,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import type { RevenuePeriod } from '@/shared/types/hospitable';

const kpiIcons: Record<string, ReactElement> = {
  revenue: <LuWallet size={18} />,
  bookings: <LuCalendarCheck size={18} />,
  occupancy: <LuPercent size={18} />,
  avg_nightly_rate: <LuTag size={18} />,
};

export function ReportsPage() {
  const { data, isLoading, isError, error, refetch } = useReports();
  const [period, setPeriod] = useState<RevenuePeriod>('30d');
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const slice = useMemo(
    () => data?.by_period[period] ?? null,
    [data, period],
  );

  if (isLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (isError || !data || !slice) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load reports'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Reports"
        description={`${slice.period_label} · revenue, occupancy and channel performance`}
        actions={
          <Flex gap="8px" align="center" wrap="wrap">
            <PeriodSegment value={period} onChange={setPeriod} />
            <ExportButton
              filename={`reports-property-performance-${period}`}
              columns={reportPropertyExportColumns}
              rows={slice.property_performance}
              h="40px"
              borderRadius="12px"
              display={{ base: 'none', md: 'inline-flex' }}
            />
            <IconButton
              aria-label="Open navigation"
              icon={<LuMenu size={20} />}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              onClick={openMobileNav}
            />
          </Flex>
        }
      />

      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          xl: 'repeat(4, 1fr)',
        }}
        gap={{ base: '12px', md: '18px' }}
      >
        {slice.kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.formatted_value}
            icon={kpiIcons[kpi.key]}
          />
        ))}
      </Grid>

      <Grid
        templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }}
        gap={{ base: '12px', md: '18px' }}
        mt={{ base: '12px', md: '18px' }}
        alignItems="stretch"
      >
        <RevenueOverview
          data={data.revenue_overview}
          period={period}
          onPeriodChange={setPeriod}
          showPeriodControl={false}
        />
        <ReportsSidePanel
          finance={slice.finance}
          occupancyAvg={slice.occupancy_avg_percent}
          occupancyByProperty={slice.occupancy_by_property}
        />
      </Grid>

      <Grid
        templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }}
        gap={{ base: '12px', md: '18px' }}
        mt={{ base: '12px', md: '18px' }}
        alignItems="stretch"
      >
        <PropertyPerformanceTable rows={slice.property_performance} />
        <ChannelBreakdownPanel rows={slice.channel_breakdown} />
      </Grid>
    </Box>
  );
}
