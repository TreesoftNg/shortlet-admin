'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import {
  formatChannelLabel,
  formatShare,
} from '@/features/reports/utils/report-formatters';
import { Panel } from '@/shared/components/ui';
import type { ChannelBreakdownRow } from '@/shared/types/hospitable';

type ChannelBreakdownPanelProps = {
  rows: ChannelBreakdownRow[];
};

export function ChannelBreakdownPanel({ rows }: ChannelBreakdownPanelProps) {
  return (
    <Panel h="100%">
      <Text fontSize="18px" fontWeight={700} mb="4px">
        Channel mix
      </Text>
      <Text color="ink.400" fontSize="14px" mb="16px">
        Bookings and revenue by channel
      </Text>

      <Flex direction="column" gap="14px">
        {rows.map((row) => (
          <Box key={row.channel}>
            <Flex justify="space-between" align="center" mb="6px" gap="8px">
              <Text fontWeight={700}>{formatChannelLabel(row.channel)}</Text>
              <Text fontSize="13px" color="ink.300">
                {row.bookings} bookings · {formatShare(row.share_percent)}
              </Text>
            </Flex>
            <Box
              h="8px"
              bg="bg.400"
              borderRadius="999px"
              overflow="hidden"
              mb="6px"
            >
              <Box
                h="100%"
                w={`${row.share_percent}%`}
                bg={row.channel === 'direct' ? 'brand.500' : 'brand.200'}
                borderRadius="999px"
              />
            </Box>
            <Text fontWeight={700} fontSize="14px">
              {formatMoney(row.revenue, row.currency)}
            </Text>
          </Box>
        ))}
      </Flex>
    </Panel>
  );
}
