import type { CsvColumn } from '@/shared/utils/export-csv';
import type { PropertyPerformance } from '../types';

export function propertyPerformanceExportColumns(currency: string): CsvColumn<PropertyPerformance>[] {
  return [
    { header: 'Property', accessor: (row) => row.propertyName },
    { header: `Revenue (${currency})`, accessor: (row) => row.revenue },
    { header: 'Bookings', accessor: (row) => row.bookings },
    { header: 'Nights', accessor: (row) => row.nights },
    { header: 'Occupancy %', accessor: (row) => row.occupancyPercent },
    { header: `Avg nightly rate (${currency})`, accessor: (row) => row.avgNightlyRate },
  ];
}
