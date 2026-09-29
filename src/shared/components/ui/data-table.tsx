'use client';

import {
  Box,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  type TableProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { EmptyState } from './empty-state';

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  isNumeric?: boolean;
  /** Extra props applied to desktop `<td>`. */
  meta?: {
    whiteSpace?: 'nowrap' | 'normal';
    fontFamily?: string;
    fontWeight?: number | string;
  };
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  minWidth?: string | number;
  selectedId?: string | null;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  size?: TableProps['size'];
};

/** Scrollable data table used on all breakpoints (row click opens detail modal). */
export function DataTable<T>({
  columns,
  data,
  getRowId,
  minWidth = '860px',
  selectedId,
  onRowClick,
  emptyTitle = 'No results',
  emptyMessage = 'No records found',
  size = 'sm',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyMessage}
        minH="220px"
        py="24px"
      />
    );
  }

  return (
    <Box overflowX="auto" mx={{ base: '-6px', md: 0 }} px={{ base: '6px', md: 0 }}>
      <Table size={size} fontSize="14px" minW={minWidth}>
        <Thead>
          <Tr>
            {columns.map((column) => (
              <Th
                key={column.id}
                textTransform="uppercase"
                letterSpacing="0.05em"
                color="ink.300"
                fontSize="12px"
                borderColor="line.500"
                whiteSpace="nowrap"
                isNumeric={column.isNumeric}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => {
            const rowId = getRowId(row);
            const isSelected = selectedId === rowId;

            return (
              <Tr
                key={rowId}
                cursor={onRowClick ? 'pointer' : 'default'}
                bg={isSelected ? 'brand.50' : undefined}
                boxShadow={
                  isSelected ? 'inset 3px 0 0 var(--brand)' : undefined
                }
                _hover={
                  onRowClick
                    ? { bg: isSelected ? 'brand.50' : 'bg.400' }
                    : undefined
                }
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((column) => (
                  <Td
                    key={column.id}
                    borderColor="line.400"
                    whiteSpace={column.meta?.whiteSpace ?? 'nowrap'}
                    fontFamily={column.meta?.fontFamily}
                    fontWeight={column.meta?.fontWeight}
                    isNumeric={column.isNumeric}
                    verticalAlign="middle"
                  >
                    {column.cell(row)}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
}
