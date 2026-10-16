import type { UnitPerformance } from '@/features/dashboard/types';
import type { CsvColumn } from '@/shared/utils/export-csv';
import type { PropertyPerformance } from '../types';

export function unitPerformanceExportColumns(currency: string): CsvColumn<UnitPerformance>[] {
  return [
    { header: 'Unit', accessor: (row) => row.unitName },
    { header: 'Code', accessor: (row) => row.unitCode },
    { header: 'Property', accessor: (row) => row.propertyName },
    { header: `Revenue (${currency})`, accessor: (row) => row.revenue },
    { header: 'Bookings', accessor: (row) => row.bookings },
    { header: 'Nights', accessor: (row) => row.nights },
    { header: 'Occupancy %', accessor: (row) => row.occupancyPercent },
    { header: `Avg nightly rate (${currency})`, accessor: (row) => row.avgNightlyRate },
    { header: 'Archived', accessor: (row) => (row.archived ? 'Yes' : 'No') },
  ];
}

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
