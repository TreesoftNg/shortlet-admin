'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { Panel, PanelHeader, SegmentedControl, StatusBadge } from '@/shared/components/ui';
import type { ReportPeriod, UnitPerformance } from '../types';
import { formatAmount, formatPercent, periodTitle } from '../utils/report-format';
import {
  rankUnits,
  showProperty,
  UNIT_RANKING_OPTIONS,
  unitPropertyLabel,
  type UnitRanking,
} from '../utils/unit-ranking';
import { OccupancyBar } from './occupancy-panel';

const TOP_UNIT_LIMIT = 5;

type TopUnitsPanelProps = {
  units: UnitPerformance[];
  unitCount: number;
  propertyCount: number;
  currency: string;
  period: ReportPeriod;
};

const RANKED_VALUE: Record<UnitRanking, (unit: UnitPerformance, currency: string) => string> = {
  revenue: (unit, currency) => formatAmount(unit.revenue, currency),
  occupancy: (unit) => (unit.occupancyPercent === null ? '—' : formatPercent(unit.occupancyPercent)),
  bookings: (unit) => `${unit.bookings} booking${unit.bookings === 1 ? '' : 's'}`,
};

/** The period's five best units by revenue, occupancy or bookings. */
export function TopUnitsPanel({ units, unitCount, propertyCount, currency, period }: TopUnitsPanelProps) {
  const [ranking, setRanking] = useState<UnitRanking>('revenue');
  const topUnits = rankUnits(units, ranking, TOP_UNIT_LIMIT);
  const hasMore = unitCount > TOP_UNIT_LIMIT;
  const countLabel = hasMore
    ? `Top ${TOP_UNIT_LIMIT} of ${unitCount} units`
    : `${unitCount} unit${unitCount === 1 ? '' : 's'}`;

  return (
    <Panel h="100%">
      <PanelHeader
        title="Top units"
        description={`${countLabel} · ${periodTitle(period)}`}
        actions={
          hasMore ? (
            <Button as={Link} href="/reports#units" size="sm" variant="soft" rightIcon={<LuArrowRight size={14} />}>
              View all {unitCount} units
            </Button>
          ) : null
        }
      />

      {topUnits.length === 0 ? (
        <Text fontSize="14px" color="ink.300">
          No units were open in this period.
        </Text>
      ) : (
        <>
          <SegmentedControl
            label="Rank units by"
            options={UNIT_RANKING_OPTIONS}
            value={ranking}
            onChange={setRanking}
            isFitted
            mb="18px"
          />
          <Flex as="ol" aria-label="Top units" listStyleType="none" direction="column" gap="16px">
            {topUnits.map((unit, index) => (
              <TopUnitRow
                key={unit.unitId}
                rank={index + 1}
                unit={unit}
                value={RANKED_VALUE[ranking](unit, currency)}
                showPropertyName={showProperty(propertyCount)}
              />
            ))}
          </Flex>
        </>
      )}
    </Panel>
  );
}

type TopUnitRowProps = {
  rank: number;
  unit: UnitPerformance;
  value: string;
  showPropertyName: boolean;
};

function TopUnitRow({ rank, unit, value, showPropertyName }: TopUnitRowProps) {
  return (
    <Flex as="li" gap="12px" align="flex-start">
      <Flex
        w="24px"
        h="24px"
        borderRadius="8px"
        bg="bg.400"
        align="center"
        justify="center"
        fontSize="12px"
        fontWeight={800}
        color="ink.400"
        flexShrink={0}
      >
        {rank}
      </Flex>
      <Box flex="1" minW={0}>
        <Flex align="center" gap="8px" fontSize="14px">
          <Text fontWeight={700} noOfLines={1}>
            {unit.unitName}
          </Text>
          {unit.unitCode ? (
            <Text fontSize="12px" color="ink.300" flexShrink={0}>
              {unit.unitCode}
            </Text>
          ) : null}
          {unit.archived ? <StatusBadge flexShrink={0}>Archived</StatusBadge> : null}
          <Text ml="auto" pl="8px" fontWeight={800} flexShrink={0}>
            {value}
          </Text>
        </Flex>
        {showPropertyName ? (
          <Text fontSize="12px" color="ink.300" noOfLines={1}>
            {unitPropertyLabel(unit)}
          </Text>
        ) : null}
        <Box mt="8px">
          <OccupancyBar percent={unit.occupancyPercent} />
        </Box>
        <Text fontSize="12px" color="ink.300" mt="4px">
          {unit.occupancyPercent === null
            ? 'No open nights'
            : `${unit.occupiedNights} of ${unit.availableNights} nights`}
        </Text>
      </Box>
    </Flex>
  );
}
