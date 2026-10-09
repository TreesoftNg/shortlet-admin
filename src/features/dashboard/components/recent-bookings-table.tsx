'use client';

import { Button, Skeleton, Stack } from '@chakra-ui/react';
import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';
import { getBookingListColumns } from '@/features/bookings/components/booking-table-config';
import { useBookings } from '@/features/bookings/hooks/use-bookings';
import { DataTable, ErrorState, Panel, PanelHeader } from '@/shared/components/ui';

const RECENT_BOOKINGS = { page: 1, limit: 5 } as const;

/** The five newest bookings, from the live bookings list. */
export function RecentBookingsTable() {
  const { data, isLoading, isError, error, refetch } = useBookings({ params: RECENT_BOOKINGS });

  return (
    <Panel h="100%" pb="6px" minW={0} overflowX="auto">
      <PanelHeader
        title="Recent bookings"
        actions={
          <Button as={Link} href="/bookings" size="sm" variant="soft" rightIcon={<LuArrowRight size={14} />}>
            View all
          </Button>
        }
      />
      {isError ? (
        <ErrorState
          minH="160px"
          message={error instanceof Error ? error.message : 'Failed to load bookings'}
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <Stack spacing="10px" py="8px">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} h="44px" borderRadius="10px" />
          ))}
        </Stack>
      ) : (
        <DataTable
          columns={getBookingListColumns()}
          data={data?.items ?? []}
          getRowId={(row) => row.id}
          emptyTitle="No bookings yet"
          emptyMessage="New bookings will appear here."
        />
      )}
    </Panel>
  );
}
