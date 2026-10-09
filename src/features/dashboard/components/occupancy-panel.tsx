'use client';

import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Panel } from '@/shared/components/ui';
import type { PropertyOccupancy } from '../types';
import { formatPercent, PROPERTY_COLORS } from '../utils/report-format';

type OccupancyPanelProps = {
  overallPercent: number;
  properties: PropertyOccupancy[];
  title?: string;
};

/** Overall occupancy and a bar per property. */
export function OccupancyPanel({ overallPercent, properties, title = 'Occupancy by property' }: OccupancyPanelProps) {
  return (
    <Panel h="100%">
      <Flex justify="space-between" align="baseline" mb="18px" gap="12px">
        <Heading as="h3" fontSize={{ base: '16px', md: '18px' }} fontWeight={700}>
          {title}
        </Heading>
        <Box textAlign="right">
          <Text fontSize="22px" fontWeight={800} lineHeight="1">
            {formatPercent(overallPercent)}
          </Text>
          <Text fontSize="11px" color="ink.300">
            overall
          </Text>
        </Box>
      </Flex>

      {properties.length === 0 ? (
        <Text fontSize="14px" color="ink.300">
          No units were open in this period.
        </Text>
      ) : (
        <Flex direction="column" gap="14px">
          {properties.map((property, index) => (
            <Box key={property.propertyId ?? property.propertyName}>
              <Flex align="center" gap="10px" fontSize="14px" mb="6px">
                <Box w="10px" h="10px" borderRadius="3px" bg={PROPERTY_COLORS[index % PROPERTY_COLORS.length]} flexShrink={0} />
                <Text flex="1" noOfLines={1}>
                  {property.propertyName}
                </Text>
                <Text fontWeight={700}>{formatPercent(property.occupancyPercent)}</Text>
              </Flex>
              <Box h="6px" bg="bg.400" borderRadius="full" overflow="hidden">
                <Box
                  h="100%"
                  w={`${Math.min(100, property.occupancyPercent)}%`}
                  bg={PROPERTY_COLORS[index % PROPERTY_COLORS.length]}
                  borderRadius="full"
                />
              </Box>
              <Text fontSize="12px" color="ink.300" mt="4px">
                {property.occupiedNights} of {property.availableNights} nights
              </Text>
            </Box>
          ))}
        </Flex>
      )}
    </Panel>
  );
}
