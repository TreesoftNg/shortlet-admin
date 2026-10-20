'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { OccupancyPanel } from '@/features/dashboard/components/occupancy-panel';
import type { UnitPerformance } from '@/features/dashboard/types';
import {
  lowestOccupancyUnits,
  showProperty,
  unitLabel,
  unitPropertyLabel,
} from '@/features/dashboard/utils/unit-ranking';
import { Panel } from '@/shared/components/ui';
import type { FinanceSummary } from '../types';
import { getFinanceRows } from '../utils/report-formatters';

const LOWEST_OCCUPANCY_LIMIT = 5;

/** Stay money for the period: gross, refunds, net and refunds still pending. */
export function FinanceSummaryPanel({ finance, currency }: { finance: FinanceSummary; currency: string }) {
  return (
    <Panel h="100%">
      <Text fontSize="18px" fontWeight={700}>
        Finance summary
      </Text>
      <Text color="ink.300" fontSize="13px" mt="2px" mb="12px">
        Stay money only; deposits are not revenue. Imported channel stays with no
        shared price do not add to these totals.
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
  );
}

type LowestOccupancyPanelProps = {
  occupancyPercent: number;
  units: UnitPerformance[];
  propertyCount: number;
};

/** The units with the smallest share of their open nights booked. */
export function LowestOccupancyPanel({ occupancyPercent, units, propertyCount }: LowestOccupancyPanelProps) {
  const rows = lowestOccupancyUnits(units, LOWEST_OCCUPANCY_LIMIT).map((unit) => ({
    id: unit.unitId,
    label: unitLabel(unit),
    sublabel: showProperty(propertyCount) ? unitPropertyLabel(unit) : null,
    occupancyPercent: unit.occupancyPercent,
    occupiedNights: unit.occupiedNights,
    availableNights: unit.availableNights,
  }));

  return (
    <OccupancyPanel
      title="Lowest occupancy"
      description="Smallest share of each unit’s open nights booked (live nights minus blocks)"
      overallPercent={occupancyPercent}
      rows={rows}
    />
  );
}
