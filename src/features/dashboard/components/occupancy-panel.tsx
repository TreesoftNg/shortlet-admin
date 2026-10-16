'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { Panel, PanelHeader } from '@/shared/components/ui';
import { formatPercent } from '../utils/report-format';

export type OccupancyRow = {
  id: string;
  label: string;
  /** Muted line under the label, e.g. the property. */
  sublabel?: string | null;
  occupancyPercent: number;
  occupiedNights: number;
  availableNights: number;
};

type OccupancyPanelProps = {
  title: string;
  description?: string;
  overallPercent: number;
  rows: OccupancyRow[];
  emptyMessage?: string;
};

/** Overall occupancy and a bar per row. */
export function OccupancyPanel({
  title,
  description,
  overallPercent,
  rows,
  emptyMessage = 'No units were open in this period.',
}: OccupancyPanelProps) {
  return (
    <Panel h="100%">
      <PanelHeader
        title={title}
        description={description}
        mb="18px"
        wrap="nowrap"
        actions={
          <Box textAlign="right" flexShrink={0}>
            <Text fontSize="22px" fontWeight={800} lineHeight="1">
              {formatPercent(overallPercent)}
            </Text>
            <Text fontSize="11px" color="ink.300">
              overall
            </Text>
          </Box>
        }
      />

      {rows.length === 0 ? (
        <Text fontSize="14px" color="ink.300">
          {emptyMessage}
        </Text>
      ) : (
        <Flex as="ul" aria-label={title} listStyleType="none" direction="column" gap="14px">
          {rows.map((row) => (
            <Box as="li" key={row.id}>
              <Flex align="center" gap="10px" fontSize="14px" mb="6px">
                <Box flex="1" minW={0}>
                  <Text noOfLines={1}>{row.label}</Text>
                  {row.sublabel ? (
                    <Text fontSize="12px" color="ink.300" noOfLines={1}>
                      {row.sublabel}
                    </Text>
                  ) : null}
                </Box>
                <Text fontWeight={700}>{formatPercent(row.occupancyPercent)}</Text>
              </Flex>
              <OccupancyBar percent={row.occupancyPercent} />
              <Text fontSize="12px" color="ink.300" mt="4px">
                {row.occupiedNights} of {row.availableNights} nights
              </Text>
            </Box>
          ))}
        </Flex>
      )}
    </Panel>
  );
}

/** Thin track filled to `percent`; left empty when there is no figure. */
export function OccupancyBar({ percent }: { percent: number | null }) {
  return (
    <Box h="6px" bg="bg.400" borderRadius="full" overflow="hidden" aria-hidden>
      <Box h="100%" w={`${Math.min(100, percent ?? 0)}%`} bg="brand.500" borderRadius="full" />
    </Box>
  );
}
