import type { Reservation } from '@/shared/types/hospitable';
import type { CsvColumn } from '@/shared/utils/export-csv';

export const bookingExportColumns: CsvColumn<Reservation>[] = [
  {
    header: 'Booking ID',
    accessor: (row) => row.platform_id,
  },
  {
    header: 'Guest',
    accessor: (row) => row.guest?.full_name ?? '',
  },
  {
    header: 'Property',
    accessor: (row) => row.property?.name ?? '',
  },
  {
    header: 'Platform',
    accessor: (row) => row.platform,
  },
  {
    header: 'Status',
    accessor: (row) => row.reservation_status.current.category,
  },
  {
    header: 'Arrival',
    accessor: (row) => row.arrival_date,
  },
  {
    header: 'Departure',
    accessor: (row) => row.departure_date,
  },
  {
    header: 'Nights',
    accessor: (row) => row.nights,
  },
  {
    header: 'Guests',
    accessor: (row) => row.guests.total,
  },
  {
    header: 'Total',
    accessor: (row) => row.financials?.total ?? '',
  },
  {
    header: 'Currency',
    accessor: (row) => row.financials?.currency ?? '',
  },
  {
    header: 'Booked on',
    accessor: (row) => row.booking_date,
  },
];
