'use client';

import {
  Box,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  type TableProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { MobileCardList } from './mobile-card-list';

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
  /** When provided, cards replace the table below the `lg` breakpoint. */
  renderMobileCard?: (row: T) => ReactNode;
  emptyMessage?: string;
  size?: TableProps['size'];
};

export function DataTable<T>({
  columns,
  data,
  getRowId,
  minWidth = '860px',
  selectedId,
  onRowClick,
  renderMobileCard,
  emptyMessage = 'No records found',
  size = 'sm',
}: DataTableProps<T>) {
  const table = (
    <Box overflowX="auto">
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
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} borderColor="line.400" py="32px">
                <Text color="ink.300" textAlign="center">
                  {emptyMessage}
                </Text>
              </Td>
            </Tr>
          ) : (
            data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedId === rowId;

              return (
                <Tr
                  key={rowId}
                  cursor={onRowClick ? 'pointer' : 'default'}
                  bg={isSelected ? 'brand.50' : undefined}
                  boxShadow={isSelected ? 'inset 3px 0 0 var(--brand)' : undefined}
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
            })
          )}
        </Tbody>
      </Table>
    </Box>
  );

  if (!renderMobileCard) {
    return table;
  }

  return (
    <>
      <Box display={{ base: 'block', lg: 'none' }}>
        <MobileCardList
          data={data}
          getRowId={getRowId}
          renderCard={renderMobileCard}
          emptyMessage={emptyMessage}
        />
      </Box>
      <Box display={{ base: 'none', lg: 'block' }}>{table}</Box>
    </>
  );
}
