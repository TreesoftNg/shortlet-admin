'use client';

import { Box, Flex, Input, InputGroup, InputLeftElement, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { LuSearch } from 'react-icons/lu';
import type { UnitPerformance } from '@/features/dashboard/types';
import { formatAmount, formatPercent } from '@/features/dashboard/utils/report-format';
import {
  searchUnits,
  showProperty,
  sortUnits,
  unitPropertyLabel,
  unitTotals,
  type UnitSortColumn,
  type UnitTotals,
} from '@/features/dashboard/utils/unit-ranking';
import {
  DataTable,
  Pagination,
  Panel,
  PanelHeader,
  StatusBadge,
  type DataTableColumn,
  type DataTableSort,
} from '@/shared/components/ui';

/** Anchor for links to this table, e.g. the dashboard's "View all units". */
const SECTION_ID = 'units';
const PAGE_SIZE = 20;
const DEFAULT_SORT: DataTableSort<UnitSortColumn> = { columnId: 'revenue', direction: 'desc' };

type UnitPerformanceTableProps = {
  units: UnitPerformance[];
  propertyCount: number;
  currency: string;
  /** Occupancy across every unit for the period, for the totals row. */
  occupancyPercent: number;
  /** Nightly rate across every unit for the period, for the totals row. */
  avgNightlyRate: number;
};

type ColumnOptions = Omit<UnitPerformanceTableProps, 'units' | 'propertyCount'> & {
  totals: UnitTotals;
  showPropertyName: boolean;
};

function unitColumns({
  currency,
  occupancyPercent,
  avgNightlyRate,
  totals,
  showPropertyName,
}: ColumnOptions): DataTableColumn<UnitPerformance, UnitSortColumn>[] {
  return [
    {
      id: 'unit',
      header: 'Unit',
      sortable: true,
      cell: (row) => (
        <Box>
          <Flex align="center" gap="8px">
            <Text fontWeight={700}>{row.unitName}</Text>
            {row.unitCode ? (
              <Text fontSize="12px" color="ink.300">
                {row.unitCode}
              </Text>
            ) : null}
            {row.archived ? <StatusBadge>Archived</StatusBadge> : null}
          </Flex>
          {showPropertyName ? (
            <Text fontSize="12px" color="ink.300">
              {unitPropertyLabel(row)}
            </Text>
          ) : null}
        </Box>
      ),
      footer: 'Total',
    },
    {
      id: 'revenue',
      header: 'Revenue',
      isNumeric: true,
      sortable: true,
      cell: (row) => formatAmount(row.revenue, currency),
      footer: formatAmount(totals.revenue, currency),
      meta: { fontWeight: 700 },
    },
    {
      id: 'bookings',
      header: 'Bookings',
      isNumeric: true,
      sortable: true,
      cell: (row) => row.bookings,
      footer: totals.bookings,
    },
    {
      id: 'nights',
      header: 'Nights',
      isNumeric: true,
      sortable: true,
      cell: (row) => row.nights,
      footer: totals.nights,
    },
    {
      id: 'occupancy',
      header: 'Occupancy',
      isNumeric: true,
      sortable: true,
      cell: (row) =>
        row.occupancyPercent === null ? (
          <Text as="span" color="ink.300">
            —
          </Text>
        ) : (
          formatPercent(row.occupancyPercent)
        ),
      footer: formatPercent(occupancyPercent),
    },
    {
      id: 'avgNightlyRate',
      header: 'Avg rate',
      isNumeric: true,
      sortable: true,
      cell: (row) => formatAmount(row.avgNightlyRate, currency),
      footer: formatAmount(avgNightlyRate, currency),
    },
  ];
}

/** Every unit's figures for the period: searchable, sortable and paged, with totals across all units. */
export function UnitPerformanceTable({
  units,
  propertyCount,
  currency,
  occupancyPercent,
  avgNightlyRate,
}: UnitPerformanceTableProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  // The table only renders once the report has loaded, too late for the browser's own jump to the anchor.
  useEffect(() => {
    if (window.location.hash === `#${SECTION_ID}`) {
      document.getElementById(SECTION_ID)?.scrollIntoView({ block: 'start' });
    }
  }, []);

  const columns = useMemo(
    () =>
      unitColumns({
        currency,
        occupancyPercent,
        avgNightlyRate,
        totals: unitTotals(units),
        showPropertyName: showProperty(propertyCount),
      }),
    [avgNightlyRate, currency, occupancyPercent, propertyCount, units],
  );
  const matches = useMemo(
    () => sortUnits(searchUnits(units, search), sort.columnId, sort.direction),
    [search, sort, units],
  );
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  // A shorter list for another period can leave the chosen page out of range.
  const currentPage = Math.min(page, totalPages);
  const pageRows = matches.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const query = search.trim();

  return (
    <Panel id={SECTION_ID} minW={0}>
      <PanelHeader
        title="Unit performance"
        description="Revenue, bookings and occupancy by unit. Occupancy is open nights in the period, not always the full calendar range."
        actions={
          <InputGroup w={{ base: '100%', md: '260px' }}>
            <InputLeftElement pointerEvents="none" h="40px" color="ink.300">
              <LuSearch size={16} />
            </InputLeftElement>
            <Input
              h="40px"
              pl="40px"
              bg="white"
              borderColor="line.500"
              borderRadius="12px"
              fontSize="14px"
              placeholder="Search units, code, property…"
              aria-label="Search units"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </InputGroup>
        }
      />

      <DataTable
        columns={columns}
        data={pageRows}
        getRowId={(row) => row.unitId}
        label="Unit performance"
        minWidth="960px"
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(1);
        }}
        emptyTitle={query ? 'No matching units' : 'No units'}
        emptyMessage={query ? `No units match “${query}”.` : 'No units were open in this period.'}
      />

      {matches.length > PAGE_SIZE ? (
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          total={matches.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      ) : null}
    </Panel>
  );
}
