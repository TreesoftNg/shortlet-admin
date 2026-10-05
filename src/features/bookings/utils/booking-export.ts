import type { CsvColumn } from '@/shared/utils/export-csv';
import type { BookingListItem } from '../types';

export const bookingExportColumns: CsvColumn<BookingListItem>[] = [
  {
    header: 'Booking ID',
    accessor: (row) => row.reference,
  },
  {
    header: 'Guest',
    accessor: (row) => row.guestName,
  },
  {
    header: 'Email',
    accessor: (row) => row.guestEmail,
  },
  {
    header: 'Property',
    accessor: (row) => row.unit.propertyName ?? '',
  },
  {
    header: 'Unit',
    accessor: (row) => row.unit.publicName ?? row.unit.name,
  },
  {
    header: 'Status',
    accessor: (row) => row.status,
  },
  {
    header: 'Check-in',
    accessor: (row) => row.checkIn,
  },
  {
    header: 'Check-out',
    accessor: (row) => row.checkOut,
  },
  {
    header: 'Nights',
    accessor: (row) => row.nights,
  },
  {
    header: 'Guests',
    accessor: (row) => row.guestCount,
  },
  {
    header: 'Total',
    accessor: (row) => row.totalAmount,
  },
  {
    header: 'Paid',
    accessor: (row) => row.amountPaid,
  },
  {
    header: 'Refunded',
    accessor: (row) => row.amountRefunded,
  },
  {
    header: 'Currency',
    accessor: (row) => row.currency,
  },
  {
    header: 'Deposit status',
    accessor: (row) => row.depositStatus,
  },
  {
    header: 'Booked on',
    accessor: (row) => row.createdAt,
  },
];
