'use client';

import {
  Avatar,
  Box,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import { Panel, StatusBadge } from '@/shared/components/ui';
import type { DashboardSummary } from '@/shared/types/hospitable';

type OccupancyPanelProps = {
  avgPercent: number;
  items: DashboardSummary['occupancy_by_property'];
  today: DashboardSummary['today'];
};

export function OccupancyPanel({ avgPercent, items, today }: OccupancyPanelProps) {
  return (
    <Panel h="100%">
      <Flex justify="space-between" align="center" mb="16px">
        <Heading as="h3" fontSize={{ base: '16px', md: '18px' }} fontWeight={700}>
          Occupancy by property
        </Heading>
      </Flex>

      <Flex
        align="center"
        gap={{ base: '16px', md: '24px' }}
        direction={{ base: 'column', sm: 'row', xl: 'column', '2xl': 'row' }}
        wrap="wrap"
      >
        <Flex
          w={{ base: '120px', md: '150px' }}
          h={{ base: '120px', md: '150px' }}
          borderRadius="full"
          border="12px solid"
          borderColor="line.400"
          align="center"
          justify="center"
          direction="column"
          flexShrink={0}
        >
          <Text fontSize={{ base: '20px', md: '22px' }} fontWeight={800}>
            {avgPercent}%
          </Text>
          <Text fontSize="11px" color="ink.300">
            avg occupancy
          </Text>
        </Flex>

        <Box flex="1" minW={{ base: '100%', sm: '180px' }} w="100%">
          {items.map((item) => (
            <Flex
              key={item.property_id}
              align="center"
              gap="10px"
              fontSize="14px"
              mb="10px"
            >
              <Box w="10px" h="10px" borderRadius="3px" bg={item.color} flexShrink={0} />
              <Text flex="1" noOfLines={1}>
                {item.property_name}
              </Text>
              <Text fontWeight={700}>{item.occupancy_percent}%</Text>
            </Flex>
          ))}
        </Box>
      </Flex>

    </Panel>
  );
}
