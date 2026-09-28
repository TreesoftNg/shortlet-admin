'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { getFinanceCards } from '@/features/reports/utils/report-formatters';
import { Panel } from '@/shared/components/ui';
import type { OccupancyByProperty, ReportsFinanceSummary } from '@/shared/types/hospitable';

type ReportsSidePanelProps = {
  finance: ReportsFinanceSummary;
  occupancyAvg: number;
  occupancyByProperty: OccupancyByProperty[];
};

export function ReportsSidePanel({
  finance,
  occupancyAvg,
  occupancyByProperty,
}: ReportsSidePanelProps) {
  const cards = getFinanceCards(finance);

  return (
    <Flex direction="column" gap="18px" h="100%">
      <Panel>
        <Text fontSize="18px" fontWeight={700} mb="4px">
          Finance summary
        </Text>
        <Text color="ink.400" fontSize="14px" mb="14px">
          Gross vs refunds for this period
        </Text>
        <Flex direction="column" gap="10px">
          {cards.map((card) => (
            <Flex
              key={card.id}
              justify="space-between"
              align="center"
              bg="bg.400"
              borderRadius="12px"
              px="12px"
              py="10px"
            >
              <Text fontSize="13px" color="ink.400" fontWeight={600}>
                {card.label}
              </Text>
              <Text fontWeight={800} fontSize="14px">
                {card.value}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Panel>

      <Panel flex="1">
        <Flex justify="space-between" align="center" mb="14px">
          <Text fontSize="18px" fontWeight={700}>
            Occupancy
          </Text>
          <Text fontWeight={800}>{occupancyAvg}%</Text>
        </Flex>
        {occupancyByProperty.map((item) => (
          <Flex
            key={item.property_id}
            align="center"
            gap="10px"
            fontSize="14px"
            mb="10px"
          >
            <Box
              w="10px"
              h="10px"
              borderRadius="3px"
              bg={item.color}
              flexShrink={0}
            />
            <Text flex="1" noOfLines={1}>
              {item.property_name}
            </Text>
            <Text fontWeight={700}>{item.occupancy_percent}%</Text>
          </Flex>
        ))}
      </Panel>
    </Flex>
  );
}
