'use client';

import { Box, IconButton } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { BookingDetailDrawer } from '@/features/bookings/components/booking-detail-drawer';
import { getBookingListColumns } from '@/features/bookings/components/booking-table-config';
import { BookingsToolbar } from '@/features/bookings/components/bookings-toolbar';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { bookingExportColumns } from '@/features/bookings/utils/booking-export';
import {
  DEFAULT_BOOKING_FILTERS,
  toListBookingsParams,
  type BookingFilters,
  type BookingTab,
} from '@/features/bookings/utils/booking-filters';
import { useProperties } from '@/features/properties/hooks/use-properties';
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

export function BookingsPage() {
  const searchParams = useSearchParams();
  const { data: profile } = useMe();
  const canRead = hasPermission(profile, 'booking.read');
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_BOOKING_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const listParams = useMemo(() => toListBookingsParams(filters), [filters]);
  const { data, isLoading, isError, error, refetch } = useBookings({
    params: listParams,
    enabled: canRead,
  });
  const { data: properties = [] } = useProperties();

  useEffect(() => {
    const search = searchParams.get('search')?.trim() ?? '';
    const tab = searchParams.get('tab') as BookingTab | null;
    setFilters((current) => {
      let next = current;
      if (search && current.search !== search) {
        next = { ...next, search, page: 1 };
      }
      if (
        tab &&
        [
          'all',
          'upcoming',
          'in_stay',
          'awaiting_payment',
          'cancelled',
          'deposits_due',
          'deposits_overdue',
        ].includes(tab) &&
        current.tab !== tab
      ) {
        next = { ...next, tab, page: 1 };
      }
      return next;
    });
  }, [searchParams]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const updateFilters = (next: Partial<BookingFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const header = (
    <PageHeader
      title="Bookings"
      description="Manage stays, payments, and security deposits."
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
          {canRead ? (
            <ExportButton
              filename={`bookings-${filters.tab}`}
              columns={bookingExportColumns}
              rows={items}
              h="44px"
              color="ink.500"
              borderRadius="12px"
            />
          ) : null}
        </>
      }
    />
  );

  if (!canRead) {
    return (
      <Box>
        {header}
        <Panel>
          <EmptyState
            title="No access"
            description="Your role does not include bookings. Ask the business owner for access."
          />
        </Panel>
      </Box>
    );
  }

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
      {header}

      <Panel pt="18px" minW={0}>
        <FilterTabs<BookingTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab, page: 1 })}
          items={[
            { id: 'all', label: 'All' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'in_stay', label: 'In stay' },
            { id: 'awaiting_payment', label: 'Awaiting payment' },
            { id: 'cancelled', label: 'Cancelled' },
            { id: 'deposits_due', label: 'Deposits due' },
            { id: 'deposits_overdue', label: 'Deposits overdue' },
          ]}
        />

        <BookingsToolbar
          filters={filters}
          properties={properties}
          onFiltersChange={updateFilters}
        />

        {total === 0 && !filters.search && filters.tab === 'all' ? (
          <EmptyState
            title="No bookings yet"
            description="Guest bookings from the public site will show up here."
          />
        ) : (
          <>
            <DataTable
              columns={getBookingListColumns()}
              data={items}
              getRowId={(row) => row.id}
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              minWidth="920px"
              emptyTitle="No matches"
              emptyMessage="No bookings match your filters"
            />

            <Pagination
              page={data?.page ?? filters.page}
              totalPages={totalPages}
              total={total}
              pageSize={filters.pageSize}
              onPageChange={(page) => updateFilters({ page })}
            />
          </>
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Booking details"
        size="xl"
      >
        <BookingDetailDrawer bookingId={selectedId} />
      </AppModal>
    </Box>
  );
}
