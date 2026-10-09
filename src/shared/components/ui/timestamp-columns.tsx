import { Box, Text } from '@chakra-ui/react';
import type { DataTableColumn } from './data-table';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Africa/Lagos',
});
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Africa/Lagos',
});

/** "9 Oct 2026" over "14:05" (Lagos time), or a dash when missing. */
export function TableDateTime({ value }: { value: string | null | undefined }) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return <Text color="ink.300">—</Text>;
  return (
    <Box whiteSpace="nowrap">
      <Text>{dateFormat.format(date)}</Text>
      <Text color="ink.300" fontSize="12px">
        {timeFormat.format(date)}
      </Text>
    </Box>
  );
}

/** "Created" and "Updated" columns, the same on every table. */
export function timestampColumns<T>(
  createdAt: (row: T) => string | null | undefined,
  updatedAt: (row: T) => string | null | undefined,
): DataTableColumn<T>[] {
  return [
    { id: 'created', header: 'Created', cell: (row) => <TableDateTime value={createdAt(row)} /> },
    { id: 'updated', header: 'Updated', cell: (row) => <TableDateTime value={updatedAt(row)} /> },
  ];
}
