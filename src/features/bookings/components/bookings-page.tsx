'use client';

import { Box, Button, Flex, Grid, Spinner, Text, useBreakpointValue } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { LuDownload, LuMenu, LuPlus } from 'react-icons/lu';
import {
  getBookingColumns,
  renderBookingMobileCard,
} from '@/features/bookings/components/booking-table-config';
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
  DataTable,
  FilterTabs,
  PageHeader,
  Pagination,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

const TODAY = '2026-09-28';

export function BookingsPage() {
  const { data, isLoading, isError, error } = useReservations();
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_BOOKING_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const showDrawerInline = useBreakpointValue({ base: false, xl: true });

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

  useEffect(() => {
    if (pageResult.items.length === 0) {
      setSelectedId(null);
      return;
    }

    const stillVisible = pageResult.items.some((item) => item.id === selectedId);
    if (!stillVisible) {
      setSelectedId(pageResult.items[0].id);
    }
  }, [pageResult.items, selectedId]);

  const selected =
    reservations.find((item) => item.id === selectedId) ??
    pageResult.items[0] ??
    null;

  const updateFilters = (next: Partial<BookingFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return (
      <Flex minH="320px" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Text color="status.danger">
        {error instanceof Error ? error.message : 'Failed to load bookings'}
      </Text>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Bookings"
        description="Manage reservations, payments and guest stays."
        actions={
          <>
            <Button
              aria-label="Open navigation"
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              minW="44px"
              onClick={openMobileNav}
            >
              <LuMenu size={20} />
            </Button>
            <Button
              h="44px"
              variant="secondary"
              leftIcon={<LuDownload size={16} />}
            >
              Export
            </Button>
            <Button h="44px" leftIcon={<LuPlus size={16} />}>
              New booking
            </Button>
          </>
        }
      />

      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 350px' }}
        gap="18px"
        alignItems="start"
      >
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

          <DataTable
            columns={getBookingColumns('bookings')}
            data={pageResult.items}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            renderMobileCard={renderBookingMobileCard}
            minWidth="760px"
            emptyMessage="No bookings match your filters"
          />

          <Pagination
            page={pageResult.page}
            totalPages={pageResult.totalPages}
            total={pageResult.total}
            pageSize={filters.pageSize}
            onPageChange={(page) => updateFilters({ page })}
          />
        </Panel>

        {showDrawerInline ? (
          <BookingDetailDrawer reservation={selected} />
        ) : selected ? (
          <Box display={{ base: 'block', xl: 'none' }}>
            <BookingDetailDrawer reservation={selected} />
          </Box>
        ) : null}
      </Grid>
    </Box>
  );
}
