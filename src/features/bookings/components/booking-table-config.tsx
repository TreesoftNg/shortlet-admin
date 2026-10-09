'use client';

import { Box, Text } from '@chakra-ui/react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { timestampColumns } from '@/shared/components/ui/timestamp-columns';
import {
  formatMoney,
  formatStayDates,
  getBookingStatusDisplay,
  getDepositStatusDisplay,
  unitLabel,
} from '../utils/booking-display';
import type { BookingListItem } from '../types';

/** Columns for the live bookings list (API BookingListItem). */
export function getBookingListColumns(): DataTableColumn<BookingListItem>[] {
  return [
    {
      id: 'guest',
      header: 'Guest',
      cell: (row) => (
        <Box>
          <Text fontWeight={700}>{row.guestName || '—'}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.guestEmail}
          </Text>
        </Box>
      ),
    },
    {
      id: 'property',
      header: 'Property',
      cell: (row) => <Text>{unitLabel(row)}</Text>,
    },
    {
      id: 'dates',
      header: 'Stay',
      cell: (row) => (
        <Box>
          <Text>{formatStayDates(row.checkIn, row.checkOut)}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.nights} nights · {row.guestCount} guests
          </Text>
        </Box>
      ),
    },
    {
      id: 'amount',
      header: 'Total',
      meta: { fontWeight: 700 },
      cell: (row) => formatMoney(row.totalAmount, row.currency),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const display = getBookingStatusDisplay(row.status);
        return <StatusBadge tone={display.tone}>{display.label}</StatusBadge>;
      },
    },
    {
      id: 'deposit',
      header: 'Deposit',
      cell: (row) => {
        const display = getDepositStatusDisplay(row.depositStatus);
        return <StatusBadge tone={display.tone}>{display.label}</StatusBadge>;
      },
    },
    ...timestampColumns<BookingListItem>(
      (row) => row.createdAt,
      (row) => row.updatedAt,
    ),
  ];
}
