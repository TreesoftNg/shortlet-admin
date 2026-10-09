'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { OccupancyPanel } from '@/features/dashboard/components/occupancy-panel';
import type { PropertyOccupancy } from '@/features/dashboard/types';
import { Panel } from '@/shared/components/ui';
import type { FinanceSummary } from '../types';
import { getFinanceRows } from '../utils/report-formatters';

type ReportsSidePanelProps = {
  finance: FinanceSummary;
  currency: string;
  occupancyPercent: number;
  occupancyByProperty: PropertyOccupancy[];
};

export function ReportsSidePanel({ finance, currency, occupancyPercent, occupancyByProperty }: ReportsSidePanelProps) {
  return (
    <Flex direction="column" gap="18px" h="100%">
      <Panel>
        <Text fontSize="18px" fontWeight={700}>
          Finance summary
        </Text>
        <Text color="ink.300" fontSize="13px" mt="2px" mb="12px">
          Stay money only; deposits are not revenue
        </Text>
        <Box border="1px solid" borderColor="line.500" borderRadius="12px" overflow="hidden">
          {getFinanceRows(finance, currency).map((row) => (
            <Flex
              key={row.id}
              justify="space-between"
              align="center"
              gap="12px"
              px="14px"
              py="10px"
              borderTop="1px solid"
              borderColor="line.500"
              _first={{ borderTop: 0 }}
              bg={'emphasize' in row ? 'bg.400' : 'white'}
            >
              <Box minW={0}>
                <Text fontSize="14px" fontWeight={600}>
                  {row.label}
                </Text>
                <Text fontSize="12px" color="ink.300">
                  {row.hint}
                </Text>
              </Box>
              <Text fontWeight={800} fontSize="14px" flexShrink={0}>
                {row.value}
              </Text>
            </Flex>
          ))}
        </Box>
      </Panel>
      <Box flex="1">
        <OccupancyPanel overallPercent={occupancyPercent} properties={occupancyByProperty} title="Occupancy" />
      </Box>
    </Flex>
  );
}
