'use client';

import { Box, Flex, IconButton, Text, useToast } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
  StatusBadge,
  type DataTableColumn,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { useSyncAllImportFeeds } from '../hooks/use-calendar-sync-mutations';
import { useCalendarUnits } from '../hooks/use-calendar-sync-queries';
import { useCalendarSyncUiStore } from '../store/calendar-sync-ui-store';
import type { UnitCalendarSummary } from '../types';
import {
  countCalendarSyncTabs,
  DEFAULT_CALENDAR_SYNC_FILTERS,
  filterCalendarUnits,
  syncableUnitIds,
  type CalendarSyncFilters,
  type CalendarSyncHealthTab,
} from '../utils/calendar-sync-filters';
import {
  describeExportHealth,
  describeImportHealth,
  errorMessage,
  formatNextSync,
  formatRelativeTime,
  truncateError,
} from '../utils/calendar-sync-format';
import { CalendarSyncToolbar } from './calendar-sync-toolbar';
import { UnitCalendarDialog } from './unit-calendar-dialog';

const columns: DataTableColumn<UnitCalendarSummary>[] = [
  {
    id: 'unit',
    header: 'Unit',
    cell: (unit) => (
      <Box minW={0}>
        <Text fontWeight={700} noOfLines={1}>
          {unit.name}
        </Text>
        {unit.publicName && unit.publicName !== unit.name ? (
          <Text fontSize="12px" color="ink.300" noOfLines={1}>
            {unit.publicName}
          </Text>
        ) : null}
      </Box>
    ),
  },
  {
    id: 'import',
    header: 'From Hospitable',
    cell: (unit) => {
      const health = describeImportHealth(unit.feed);
      const error = truncateError(unit.feed?.lastError ?? null);
      return (
        <Flex direction="column" gap="4px" align="flex-start" maxW="220px">
          <StatusBadge tone={health.tone}>{health.label}</StatusBadge>
          {unit.feed ? (
            <Text fontSize="12px" color="ink.300">
              Synced {formatRelativeTime(unit.feed.lastSucceededAt)}
              {' · '}
              Next {formatNextSync(unit.feed.nextFetchAt)}
            </Text>
          ) : (
            <Text fontSize="12px" color="ink.300">
              Paste a Hospitable iCal link to connect
            </Text>
          )}
          {error ? (
            <Text fontSize="12px" color="status.danger" noOfLines={2} title={unit.feed?.lastError ?? undefined}>
              {error}
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
      return (
        <Flex direction="column" gap="4px" align="flex-start">
          <StatusBadge tone={health.tone}>{health.label}</StatusBadge>
          {unit.exportFeed?.lastAccessedAt ? (
            <Text fontSize="12px" color="ink.300">
              Fetched {formatRelativeTime(unit.exportFeed.lastAccessedAt)}
            </Text>
          ) : null}
        </Flex>
      );
    },
  },
];

export function CalendarSyncPage() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'integration.manage');
  const units = useCalendarUnits({ enabled: canManage });
  const syncAll = useSyncAllImportFeeds();
  const [filters, setFilters] = useState<CalendarSyncFilters>(DEFAULT_CALENDAR_SYNC_FILTERS);
  const selectedUnitId = useCalendarSyncUiStore((state) => state.selectedUnitId);
  const openUnit = useCalendarSyncUiStore((state) => state.openUnit);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  useEffect(() => {
    const unitId = searchParams.get('unitId')?.trim();
    if (!unitId || !units.data?.length) return;
    const match = units.data.find((unit) => unit.unitId === unitId);
    if (match) openUnit(match.unitId);
  }, [openUnit, searchParams, units.data]);

  const tabCounts = useMemo(
    () => countCalendarSyncTabs(units.data ?? []),
    [units.data],
  );

  const filtered = useMemo(
    () => filterCalendarUnits(units.data ?? [], filters),
    [filters, units.data],
  );

  const syncableIds = useMemo(() => syncableUnitIds(filtered), [filtered]);

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

  const handleSyncAll = () => {
    if (syncableIds.length === 0) return;
    syncAll.mutate(syncableIds, {
      onSuccess: ({ total, succeeded, failed }) => {
        toast({
          status: failed > 0 ? 'warning' : 'success',
          title: failed > 0 ? 'Sync finished with errors' : 'All connected units synced',
          description:
            failed > 0
              ? `${succeeded} of ${total} succeeded, ${failed} failed.`
              : `${succeeded} unit${succeeded === 1 ? '' : 's'} updated from Hospitable.`,
          duration: 4000,
          isClosable: true,
        });
      },
      onError: (error) =>
        toast({
          status: 'error',
          title: 'Could not sync calendars',
          description: errorMessage(error),
        }),
    });
  };

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
        <FilterTabs<CalendarSyncHealthTab>
          value={filters.tab}
          onChange={(tab) => setFilters((current) => ({ ...current, tab }))}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'needs_attention', label: 'Needs attention', count: tabCounts.needs_attention },
            { id: 'connected', label: 'Connected', count: tabCounts.connected },
            { id: 'failing', label: 'Failing', count: tabCounts.failing },
            { id: 'not_connected', label: 'Not connected', count: tabCounts.not_connected },
          ]}
        />

        <CalendarSyncToolbar
          filters={filters}
          syncableCount={syncableIds.length}
          isSyncingAll={syncAll.isPending}
          onFiltersChange={(next) => setFilters((current) => ({ ...current, ...next }))}
          onSyncAll={handleSyncAll}
        />

        {units.data.length === 0 ? (
          <EmptyState
            title="No units yet"
            description="Units appear here once they are added."
          />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(unit) => unit.unitId}
            selectedId={selectedUnitId}
            onRowClick={(unit) => openUnit(unit.unitId)}
            minWidth="860px"
            emptyTitle="No matches"
            emptyMessage="No units match your filters."
          />
        )}
      </Panel>
      {selected ? <UnitCalendarDialog unit={selected} /> : null}
    </Box>
  );
}
