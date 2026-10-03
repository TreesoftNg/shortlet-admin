'use client';

import { Box, Button, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LuMenu, LuPlus } from 'react-icons/lu';
import { getBookingColumns } from '@/features/bookings/components/booking-table-config';
import { BookingDetailDrawer } from '@/features/bookings/components/booking-detail-drawer';
import { BookingsToolbar } from '@/features/bookings/components/bookings-toolbar';
import { useReservations } from '@/features/bookings/hooks/use-reservations';
import { bookingExportColumns } from '@/features/bookings/utils/booking-export';
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
  ExportButton,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Pagination,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

const TODAY = '2026-09-28';

export function BookingsPage() {
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useReservations();
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_BOOKING_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  useEffect(() => {
    const search = searchParams.get('search')?.trim() ?? '';
    if (!search) return;
    setFilters((current) =>
      current.search === search ? current : { ...current, search, page: 1 },
    );
  }, [searchParams]);

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
            <ExportButton
              filename={`bookings-${filters.tab}`}
              columns={bookingExportColumns}
              rows={filtered}
              h="44px"
              color="ink.500"
              borderRadius="12px"
            />
            <Button
              as={Link}
              href="/bookings/new"
              h="44px"
              leftIcon={<LuPlus size={16} />}
            >
              Add booking
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
            description="Create a booking on behalf of a guest to get started."
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
