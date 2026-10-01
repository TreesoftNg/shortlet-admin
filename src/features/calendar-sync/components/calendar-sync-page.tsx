'use client';

import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import {
  DataTable,
  EmptyState,
  ErrorState,
  PageHeader,
  PageSkeleton,
  Panel,
  StatusBadge,
  type DataTableColumn,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { useCalendarUnits } from '../hooks/use-calendar-sync-queries';
import { useCalendarSyncUiStore } from '../store/calendar-sync-ui-store';
import type { UnitCalendarSummary } from '../types';
import { describeExportHealth, describeImportHealth, errorMessage, formatRelativeTime } from '../utils/calendar-sync-format';
import { UnitCalendarDialog } from './unit-calendar-dialog';

const columns: DataTableColumn<UnitCalendarSummary>[] = [
  {
    id: 'unit',
    header: 'Unit',
    cell: (unit) => (
      <Text fontWeight={700} noOfLines={2}>
        {unit.name}
      </Text>
    ),
  },
  {
    id: 'import',
    header: 'From Hospitable',
    cell: (unit) => {
      const health = describeImportHealth(unit.feed);
      return (
        <Flex direction="column" gap="4px" align="flex-start">
          <StatusBadge tone={health.tone}>{health.label}</StatusBadge>
          {unit.feed ? (
            <Text fontSize="12px" color="ink.300">
              Synced {formatRelativeTime(unit.feed.lastSucceededAt)}
            </Text>
          ) : null}
        </Flex>
      );
    },
  },
  {
    id: 'bookings',
    header: 'Upcoming bookings',
    isNumeric: true,
    cell: (unit) => unit.feed?.upcomingEventCount ?? '—',
  },
  {
    id: 'blocks',
    header: 'Blocked dates',
    isNumeric: true,
    cell: (unit) => unit.upcomingBlockCount,
  },
  {
    id: 'export',
    header: 'To Hospitable',
    cell: (unit) => {
      const health = describeExportHealth(unit.exportFeed);
      return <StatusBadge tone={health.tone}>{health.label}</StatusBadge>;
    },
  },
];

export function CalendarSyncPage() {
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'integration.manage');
  const units = useCalendarUnits({ enabled: canManage });
  const selectedUnitId = useCalendarSyncUiStore((state) => state.selectedUnitId);
  const openUnit = useCalendarSyncUiStore((state) => state.openUnit);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const header = (
    <PageHeader
      title="Calendar sync"
      description="Keep each unit's calendar in step with Hospitable, and through it Airbnb and Booking.com."
      actions={
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
      }
    />
  );

  if (!canManage) {
    return (
      <Box>
        {header}
        <Panel>
          <EmptyState
            title="No access"
            description="Your role does not include calendar sync. Ask the business owner for access."
          />
        </Panel>
      </Box>
    );
  }
  if (units.isPending) return <PageSkeleton variant="table" />;
  if (units.isError) {
    return <ErrorState message={errorMessage(units.error)} onRetry={() => void units.refetch()} />;
  }

  const selected = units.data.find((unit) => unit.unitId === selectedUnitId) ?? null;

  return (
    <Box>
      {header}
      <Panel pt="18px" minW={0}>
        <DataTable
          columns={columns}
          data={units.data}
          getRowId={(unit) => unit.unitId}
          selectedId={selectedUnitId}
          onRowClick={(unit) => openUnit(unit.unitId)}
          minWidth="760px"
          emptyTitle="No units yet"
          emptyMessage="Units appear here once they are added."
        />
      </Panel>
      {selected ? <UnitCalendarDialog unit={selected} /> : null}
    </Box>
  );
}
