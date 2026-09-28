'use client';

import { Box, Flex, Grid, Spinner, Text } from '@chakra-ui/react';
import { LuCalendarCheck, LuPercent, LuTag, LuWallet } from 'react-icons/lu';
import type { ReactElement } from 'react';
import { KpiCard } from '@/shared/components/ui';
import { useDashboardSummary } from '../hooks/use-dashboard-summary';
import { DashboardTopbar } from './dashboard-topbar';
import { OccupancyPanel } from './occupancy-panel';
import { RecentBookingsTable } from './recent-bookings-table';
import { RevenueOverview } from './revenue-overview';

const kpiIcons: Record<string, ReactElement> = {
  revenue: <LuWallet size={18} />,
  bookings: <LuCalendarCheck size={18} />,
  occupancy: <LuPercent size={18} />,
  avg_nightly_rate: <LuTag size={18} />,
};

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <Flex minH="320px" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (isError || !data) {
    return (
      <Box>
        <Text color="status.danger">
          {error instanceof Error ? error.message : 'Failed to load dashboard'}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <DashboardTopbar
        greetingName={data.greeting_name}
        periodLabel={data.period_label}
      />

      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          xl: 'repeat(4, 1fr)',
        }}
        gap={{ base: '12px', md: '18px' }}
      >
        {data.kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            label={kpi.label}
            value={kpi.formatted_value}
            deltaPercent={kpi.delta_percent}
            icon={kpiIcons[kpi.key]}
          />
        ))}
      </Grid>

      <Grid
        templateColumns={{ base: '1fr', xl: '1.8fr 1fr' }}
        gap={{ base: '12px', md: '18px' }}
        mt={{ base: '12px', md: '18px' }}
        alignItems="stretch"
      >
        <RevenueOverview data={data.revenue_overview} />
        <OccupancyPanel
          avgPercent={data.occupancy_avg_percent}
          items={data.occupancy_by_property}
          today={data.today}
        />
      </Grid>

      <RecentBookingsTable reservations={data.recent_reservations} />
    </Box>
  );
}
