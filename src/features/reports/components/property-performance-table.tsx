'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import {
  formatOccupancy,
  getPropertyPerformanceTotals,
} from '@/features/reports/utils/report-formatters';
import { Panel } from '@/shared/components/ui';
import type { PropertyPerformanceRow } from '@/shared/types/hospitable';

type PropertyPerformanceTableProps = {
  rows: PropertyPerformanceRow[];
};

export function PropertyPerformanceTable({
  rows,
}: PropertyPerformanceTableProps) {
  const totals = getPropertyPerformanceTotals(rows);
  const currency = rows[0]?.currency ?? 'NGN';

  return (
    <Panel pt="18px" overflowX="auto">
      <Flex justify="space-between" align="center" mb="14px" px="2px">
        <Box>
          <Text fontSize="18px" fontWeight={700}>
            Property performance
          </Text>
          <Text color="ink.400" fontSize="14px" mt="2px">
            Revenue, bookings and occupancy by property
          </Text>
        </Box>
      </Flex>

      <Box as="table" w="100%" minW="720px" fontSize="14px" sx={{ borderCollapse: 'collapse' }}>
        <Box as="thead">
          <Box as="tr" borderBottom="1px solid" borderColor="line.500">
            {[
              'Property',
              'Revenue',
              'Bookings',
              'Nights',
              'Occupancy',
              'ADR',
            ].map((header) => (
              <Box
                as="th"
                key={header}
                textAlign={header === 'Property' ? 'left' : 'right'}
                py="10px"
                px="8px"
                fontSize="12px"
                fontWeight={700}
                color="ink.300"
                textTransform="uppercase"
                letterSpacing="0.04em"
              >
                {header}
              </Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">
          {rows.map((row) => (
            <Box
              as="tr"
              key={row.property_id}
              borderBottom="1px solid"
              borderColor="line.400"
            >
              <Box as="td" py="14px" px="8px" fontWeight={700}>
                {row.property_name}
              </Box>
              <Box as="td" py="14px" px="8px" textAlign="right" fontWeight={700}>
                {formatMoney(row.revenue, row.currency)}
              </Box>
              <Box as="td" py="14px" px="8px" textAlign="right">
                {row.bookings}
              </Box>
              <Box as="td" py="14px" px="8px" textAlign="right">
                {row.nights_booked}
              </Box>
              <Box as="td" py="14px" px="8px" textAlign="right">
                {formatOccupancy(row.occupancy_percent)}
              </Box>
              <Box as="td" py="14px" px="8px" textAlign="right">
                {formatMoney(row.avg_nightly_rate, row.currency)}
              </Box>
            </Box>
          ))}
        </Box>
        <Box as="tfoot">
          <Box as="tr">
            <Box as="td" py="14px" px="8px" fontWeight={800}>
              Total
            </Box>
            <Box as="td" py="14px" px="8px" textAlign="right" fontWeight={800}>
              {formatMoney(totals.revenue, currency)}
            </Box>
            <Box as="td" py="14px" px="8px" textAlign="right" fontWeight={700}>
              {totals.bookings}
            </Box>
            <Box as="td" py="14px" px="8px" textAlign="right" fontWeight={700}>
              {totals.nights_booked}
            </Box>
            <Box as="td" py="14px" px="8px" textAlign="right" color="ink.300">
              —
            </Box>
            <Box as="td" py="14px" px="8px" textAlign="right" color="ink.300">
              —
            </Box>
          </Box>
        </Box>
      </Box>
    </Panel>
  );
}
