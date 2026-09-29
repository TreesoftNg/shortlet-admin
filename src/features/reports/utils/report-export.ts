import type { PropertyPerformanceRow } from '@/shared/types/hospitable';
import type { CsvColumn } from '@/shared/utils/export-csv';

export const reportPropertyExportColumns: CsvColumn<PropertyPerformanceRow>[] =
  [
    {
      header: 'Property',
      accessor: (row) => row.property_name,
    },
    {
      header: 'Revenue',
      accessor: (row) => row.revenue,
    },
    {
      header: 'Currency',
      accessor: (row) => row.currency,
    },
    {
      header: 'Bookings',
      accessor: (row) => row.bookings,
    },
    {
      header: 'Occupancy %',
      accessor: (row) => row.occupancy_percent,
    },
    {
      header: 'Avg nightly rate',
      accessor: (row) => row.avg_nightly_rate,
    },
    {
      header: 'Nights booked',
      accessor: (row) => row.nights_booked,
    },
  ];
