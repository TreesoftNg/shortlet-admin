'use client';

import {
  Box,
  Button,
  Table,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  type TableProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuArrowDown, LuArrowUp, LuArrowUpDown } from 'react-icons/lu';
import { EmptyState } from './empty-state';

export type DataTableColumn<T, Id extends string = string> = {
  id: Id;
  header: string;
  cell: (row: T) => ReactNode;
  isNumeric?: boolean;
  /** Header becomes a sort button when the table has `onSortChange`. */
  sortable?: boolean;
  /** Cell for the totals row; the row shows when any column has one. */
  footer?: ReactNode;
  /** Extra props applied to desktop `<td>`. */
  meta?: {
    whiteSpace?: 'nowrap' | 'normal';
    fontFamily?: string;
    fontWeight?: number | string;
  };
};

export type DataTableSort<Id extends string = string> = {
  columnId: Id;
  direction: 'asc' | 'desc';
};

export type DataTableProps<T, Id extends string = string> = {
  columns: DataTableColumn<T, Id>[];
  data: T[];
  getRowId: (row: T) => string;
  /** Accessible name of the table. */
  label?: string;
  minWidth?: string | number;
  selectedId?: string | null;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  size?: TableProps['size'];
  /** Current sort; the caller sorts `data`. */
  sort?: DataTableSort<Id>;
  onSortChange?: (sort: DataTableSort<Id>) => void;
};

/** The same column flips direction; a new one starts largest-first for numbers and A–Z for text. */
function nextSort<T, Id extends string>(column: DataTableColumn<T, Id>, sort?: DataTableSort<Id>): DataTableSort<Id> {
  if (sort?.columnId === column.id) {
    return { columnId: column.id, direction: sort.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { columnId: column.id, direction: column.isNumeric ? 'desc' : 'asc' };
}

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

function SortIcon({ direction }: { direction?: DataTableSort['direction'] }) {
  if (direction === 'asc') return <LuArrowUp size={12} aria-hidden />;
  if (direction === 'desc') return <LuArrowDown size={12} aria-hidden />;
  return <LuArrowUpDown size={12} aria-hidden />;
}

/** Scrollable data table used on all breakpoints (row click opens detail modal). */
export function DataTable<T, Id extends string = string>({
  columns,
  data,
  getRowId,
  label,
  minWidth = '860px',
  selectedId,
  onRowClick,
  emptyTitle = 'No results',
  emptyMessage = 'No records found',
  size = 'sm',
  sort,
  onSortChange,
}: DataTableProps<T, Id>) {
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

  const hasFooter = columns.some((column) => column.footer !== undefined);

  return (
    <Box overflowX="auto" mx={{ base: '-6px', md: 0 }} px={{ base: '6px', md: 0 }}>
      <Table size={size} fontSize="14px" minW={minWidth} aria-label={label}>
        <Thead>
          <Tr>
            {columns.map((column) => {
              const isSortable = Boolean(column.sortable && onSortChange);
              const direction = sort?.columnId === column.id ? sort.direction : undefined;

              return (
                <Th
                  key={column.id}
                  textTransform="uppercase"
                  letterSpacing="0.05em"
                  color="ink.300"
                  fontSize="12px"
                  borderColor="line.500"
                  whiteSpace="nowrap"
                  isNumeric={column.isNumeric}
                  aria-sort={isSortable ? (direction ? ARIA_SORT[direction] : 'none') : undefined}
                >
                  {isSortable ? (
                    <Button
                      type="button"
                      variant="unstyled"
                      display="inline-flex"
                      alignItems="center"
                      gap="4px"
                      h="auto"
                      minW="auto"
                      fontSize="inherit"
                      fontWeight="inherit"
                      letterSpacing="inherit"
                      textTransform="inherit"
                      color={direction ? 'ink.500' : 'inherit'}
                      onClick={() => onSortChange?.(nextSort(column, sort))}
                    >
                      {column.header}
                      <SortIcon direction={direction} />
                    </Button>
                  ) : (
                    column.header
                  )}
                </Th>
              );
            })}
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
        {hasFooter ? (
          <Tfoot>
            <Tr>
              {columns.map((column) => (
                <Td
                  key={column.id}
                  borderBottom={0}
                  whiteSpace="nowrap"
                  fontWeight={800}
                  isNumeric={column.isNumeric}
                  verticalAlign="middle"
                >
                  {column.footer}
                </Td>
              ))}
            </Tr>
          </Tfoot>
        ) : null}
      </Table>
    </Box>
  );
}
