'use client';

import { Box, Button, IconButton } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuDownload, LuMenu } from 'react-icons/lu';
import { getBookingColumns } from '@/features/bookings/components/booking-table-config';
import { BookingDetailDrawer } from '@/features/bookings/components/booking-detail-drawer';
import { BookingsToolbar } from '@/features/bookings/components/bookings-toolbar';
import { useReservations } from '@/features/bookings/hooks/use-reservations';
import {
  countBookingTabs,
  DEFAULT_BOOKING_FILTERS,
  filterReservations,
  paginateReservations,
  type BookingFilters,
  type BookingTab,
} from '@/features/bookings/utils/booking-filters';
import { mockProperties } from '@/mocks/data';
import {
  AppModal,
  DataTable,
  EmptyState,
  ErrorState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Pagination,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

const TODAY = '2026-09-28';

export function BookingsPage() {
  const { data, isLoading, isError, error, refetch } = useReservations();
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_BOOKING_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const reservations = data ?? [];

  const tabCounts = useMemo(
    () => countBookingTabs(reservations, TODAY),
    [reservations],
  );

  const filtered = useMemo(
    () => filterReservations(reservations, filters, TODAY),
    [filters, reservations],
  );

  const pageResult = useMemo(
    () => paginateReservations(filtered, filters.page, filters.pageSize),
    [filtered, filters.page, filters.pageSize],
  );

  const selected = reservations.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<BookingFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load bookings'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Bookings"
        description="Manage reservations, payments and guest stays."
        actions={
          <>
            <IconButton
              aria-label="Open navigation"
              icon={<LuMenu size={20} />}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              color="ink.500"
              onClick={openMobileNav}
            />
            <Button
              h="44px"
              variant="secondary"
              color="ink.500"
              leftIcon={<LuDownload size={16} />}
            >
              Export
            </Button>
          </>
        }
      />

      <Panel pt="18px" minW={0}>
        <FilterTabs<BookingTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab, page: 1 })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'upcoming', label: 'Upcoming', count: tabCounts.upcoming },
            {
              id: 'awaiting_payment',
              label: 'Awaiting payment',
              count: tabCounts.awaiting_payment,
            },
            { id: 'cancelled', label: 'Cancelled', count: tabCounts.cancelled },
          ]}
        />

        <BookingsToolbar
          filters={filters}
          properties={mockProperties}
          onFiltersChange={updateFilters}
        />

        {reservations.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="When bookings are available, they will show up here."
          />
        ) : (
          <>
            <DataTable
              columns={getBookingColumns('bookings')}
              data={pageResult.items}
              getRowId={(row) => row.id}
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              minWidth="760px"
              emptyTitle="No matches"
              emptyMessage="No bookings match your filters"
            />

            <Pagination
              page={pageResult.page}
              totalPages={pageResult.totalPages}
              total={pageResult.total}
              pageSize={filters.pageSize}
              onPageChange={(page) => updateFilters({ page })}
            />
          </>
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Booking details"
        size="xl"
      >
        <BookingDetailDrawer reservation={selected} />
      </AppModal>
    </Box>
  );
}
