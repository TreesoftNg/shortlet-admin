'use client';

import { Button } from '@chakra-ui/react';
import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';
import {
  getBookingColumns,
  renderBookingMobileCard,
} from '@/features/bookings/components/booking-table-config';
import { DataTable, Panel, PanelHeader } from '@/shared/components/ui';
import type { Reservation } from '@/shared/types/hospitable';

type RecentBookingsTableProps = {
  reservations: Reservation[];
};

export function RecentBookingsTable({ reservations }: RecentBookingsTableProps) {
  return (
    <Panel mt={{ base: '12px', md: '18px' }} pb="6px">
      <PanelHeader
        title="Recent bookings"
        actions={
          <Button
            as={Link}
            href="/bookings"
            size="sm"
            variant="soft"
            rightIcon={<LuArrowRight size={14} />}
          >
            View all
          </Button>
        }
      />

      <DataTable
        columns={getBookingColumns('dashboard')}
        data={reservations}
        getRowId={(row) => row.id}
        renderMobileCard={renderBookingMobileCard}
        emptyMessage="No recent bookings"
      />
    </Panel>
  );
}
