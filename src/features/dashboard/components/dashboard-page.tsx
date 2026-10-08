'use client';

import { Box, Flex, Grid, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { ErrorState, PageSkeleton, Panel } from '@/shared/components/ui';
import { useDashboard } from '../hooks/use-dashboard';
import type { ReportPeriod } from '../types';
import { periodTitle, rangeLabel } from '../utils/report-format';
import { DashboardTopbar } from './dashboard-topbar';
import { KpiGrid } from './kpi-grid';
import { OccupancyPanel } from './occupancy-panel';
import { OtherCurrenciesNote } from './other-currencies-note';
import { PeriodSegment } from './period-segment';
import { RecentBookingsTable } from './recent-bookings-table';
import { RevenueOverview } from './revenue-overview';
import { TodayPanel } from './today-panel';

export function DashboardPage() {
  const { data: profile } = useMe();
  const canViewFigures = hasPermission(profile, 'reports.view');
  const canViewBookings = hasPermission(profile, 'booking.read');
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboard(period, canViewFigures);
  const firstName = profile?.user.firstName ?? null;

  if (!canViewFigures) {
    return (
      <Box>
        <DashboardTopbar firstName={firstName} subtitle="Here's what's happening across your properties." />
        <Panel mb="18px">
          <Text fontSize="14px" color="ink.400">
            Revenue, occupancy and reports are available to owners, admins and managers.
          </Text>
        </Panel>
        {canViewBookings ? <RecentBookingsTable /> : null}
      </Box>
    );
  }

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load dashboard'}
        onRetry={() => void refetch()}
      />
    );
  }

  const subtitle = `${periodTitle(period)} · ${rangeLabel(data.range)}`;

  return (
    <Box opacity={isFetching && data.period !== period ? 0.6 : 1} transition="opacity 0.2s">
      <DashboardTopbar
        firstName={firstName}
        subtitle={subtitle}
        actions={<PeriodSegment value={period} onChange={setPeriod} />}
      />

      <Flex direction="column" gap={{ base: '12px', md: '18px' }}>
        <KpiGrid kpis={data.keyPerformanceIndicators} currency={data.currency} period={period} />
        <OtherCurrenciesNote entries={data.otherCurrencies} currency={data.currency} />

        <Grid templateColumns={{ base: '1fr', xl: '1.8fr 1fr' }} gap={{ base: '12px', md: '18px' }} alignItems="stretch">
          <RevenueOverview points={data.revenueOverview} currency={data.currency} subtitle={subtitle} />
          <OccupancyPanel
            overallPercent={data.keyPerformanceIndicators.occupancyPercent.value}
            properties={data.occupancyByProperty}
          />
        </Grid>

        <Grid templateColumns={{ base: '1fr', xl: '1.8fr 1fr' }} gap={{ base: '12px', md: '18px' }} alignItems="stretch">
          {canViewBookings ? <RecentBookingsTable /> : <Box />}
          <TodayPanel date={data.today.date} checkIns={data.today.checkIns} checkOuts={data.today.checkOuts} />
        </Grid>
      </Flex>
    </Box>
  );
}
