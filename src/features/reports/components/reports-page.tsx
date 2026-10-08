'use client';

import { Box, Flex, Grid, IconButton, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { KpiGrid } from '@/features/dashboard/components/kpi-grid';
import { OtherCurrenciesNote } from '@/features/dashboard/components/other-currencies-note';
import { PeriodSegment } from '@/features/dashboard/components/period-segment';
import { RevenueOverview } from '@/features/dashboard/components/revenue-overview';
import type { ReportPeriod } from '@/features/dashboard/types';
import { periodTitle, rangeLabel } from '@/features/dashboard/utils/report-format';
import { ErrorState, ExportButton, PageHeader, PageSkeleton, Panel } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { useReports } from '../hooks/use-reports';
import { propertyPerformanceExportColumns } from '../utils/report-export';
import { ChannelBreakdownPanel } from './channel-breakdown-panel';
import { PropertyPerformanceTable } from './property-performance-table';
import { ReportsSidePanel } from './reports-side-panel';

export function ReportsPage() {
  const { data: profile } = useMe();
  const canView = hasPermission(profile, 'reports.view');
  const [period, setPeriod] = useState<ReportPeriod>('30d');
  const { data, isLoading, isError, error, refetch, isFetching } = useReports(period, canView);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const navButton = (
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
  );

  if (!canView) {
    return (
      <Box>
        <PageHeader title="Reports" description="Revenue, occupancy and channel performance" actions={navButton} />
        <Panel>
          <Text fontSize="14px" color="ink.400">
            Reports are available to owners, admins and managers.
          </Text>
        </Panel>
      </Box>
    );
  }

  if (isLoading) return <PageSkeleton variant="dashboard" />;
  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load reports'}
        onRetry={() => void refetch()}
      />
    );
  }

  const subtitle = `${periodTitle(period)} · ${rangeLabel(data.range)}`;

  return (
    <Box opacity={isFetching && data.period !== period ? 0.6 : 1} transition="opacity 0.2s">
      <PageHeader
        title="Reports"
        description={subtitle}
        actions={
          <Flex gap="8px" align="center" wrap="wrap">
            <PeriodSegment value={period} onChange={setPeriod} />
            <ExportButton
              filename={`property-performance-${data.range.startDate}-to-${data.range.endDate}`}
              columns={propertyPerformanceExportColumns(data.currency)}
              rows={data.propertyPerformance}
              h="40px"
              borderRadius="12px"
              display={{ base: 'none', md: 'inline-flex' }}
            />
            {navButton}
          </Flex>
        }
      />

      <Flex direction="column" gap={{ base: '12px', md: '18px' }}>
        <KpiGrid kpis={data.keyPerformanceIndicators} currency={data.currency} period={period} />
        <OtherCurrenciesNote entries={data.otherCurrencies} currency={data.currency} />

        <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={{ base: '12px', md: '18px' }} alignItems="stretch">
          <RevenueOverview points={data.revenueOverview} currency={data.currency} subtitle={subtitle} />
          <ReportsSidePanel
            finance={data.finance}
            currency={data.currency}
            occupancyPercent={data.keyPerformanceIndicators.occupancyPercent.value}
            occupancyByProperty={data.occupancyByProperty}
          />
        </Grid>

        <Grid templateColumns={{ base: '1fr', xl: '1.7fr 1fr' }} gap={{ base: '12px', md: '18px' }} alignItems="stretch">
          <PropertyPerformanceTable rows={data.propertyPerformance} currency={data.currency} />
          <ChannelBreakdownPanel rows={data.channelMix} currency={data.currency} />
        </Grid>
      </Flex>
    </Box>
  );
}
