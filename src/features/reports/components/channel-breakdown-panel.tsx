'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { formatAmount, formatPercent } from '@/features/dashboard/utils/report-format';
import { Panel } from '@/shared/components/ui';
import type { ChannelMix } from '../types';

const CHANNEL_COLORS: Record<ChannelMix['channel'], string> = {
  website: 'brand.500',
  staff: 'brand.300',
  imported: '#F59E0B',
};

export function ChannelBreakdownPanel({ rows, currency }: { rows: ChannelMix[]; currency: string }) {
  return (
    <Panel h="100%">
      <Text fontSize="18px" fontWeight={700}>
        Channel mix
      </Text>
      <Text color="ink.300" fontSize="13px" mt="2px" mb="16px">
        Where this period&apos;s bookings came from
      </Text>

      <Flex direction="column" gap="16px">
        {rows.map((row) => (
          <Box key={row.channel}>
            <Flex justify="space-between" align="baseline" mb="6px" gap="8px">
              <Text fontWeight={700} fontSize="14px">
                {row.label}
              </Text>
              <Text fontSize="13px" color="ink.400" fontWeight={600}>
                {formatPercent(row.sharePercent)}
              </Text>
            </Flex>
            <Box h="8px" bg="bg.400" borderRadius="full" overflow="hidden" mb="6px">
              <Box h="100%" w={`${row.sharePercent}%`} bg={CHANNEL_COLORS[row.channel]} borderRadius="full" />
            </Box>
            <Flex justify="space-between" fontSize="13px" color="ink.300" gap="8px">
              <Text>
                {row.bookings} booking{row.bookings === 1 ? '' : 's'} · {row.nights} night{row.nights === 1 ? '' : 's'}
              </Text>
              <Text fontWeight={700} color={row.revenue === null ? 'ink.300' : 'ink.500'}>
                {row.revenue === null ? 'Price not shared' : formatAmount(row.revenue, currency)}
              </Text>
            </Flex>
          </Box>
        ))}
      </Flex>
    </Panel>
  );
}
