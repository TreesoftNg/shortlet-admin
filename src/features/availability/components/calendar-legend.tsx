'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { CalendarEventKind } from '@/shared/types/hospitable';

export const CALENDAR_LEGEND: Array<{
  kind: CalendarEventKind;
  label: string;
}> = [
  { kind: 'confirmed', label: 'Confirmed' },
  { kind: 'checked_in', label: 'Checked in' },
  { kind: 'awaiting_payment', label: 'Awaiting payment' },
  { kind: 'external', label: 'External (Hospitable)' },
  { kind: 'blocked', label: 'Blocked' },
];

export function getEventBarStyles(kind: CalendarEventKind) {
  switch (kind) {
    case 'confirmed':
      return {
        bg: 'brand.500',
        color: 'white',
        border: 'none',
      };
    case 'checked_in':
      return {
        bg: 'ink.500',
        color: 'white',
        border: 'none',
      };
    case 'awaiting_payment':
      return {
        bg: 'white',
        color: '#8A5A08',
        border: '1.5px dashed',
        borderColor: 'status.warn',
      };
    case 'external':
      return {
        bg: 'status.info',
        color: 'white',
        border: 'none',
      };
    case 'blocked':
      return {
        bgImage:
          'repeating-linear-gradient(135deg, #EDEDEA 0 6px, #F6F6F3 6px 12px)',
        color: 'ink.400',
        border: '1px solid',
        borderColor: '#DDDDD8',
      };
    default:
      return {
        bg: 'line.400',
        color: 'ink.400',
        border: 'none',
      };
  }
}

export function getLegendSwatchStyles(kind: CalendarEventKind) {
  switch (kind) {
    case 'confirmed':
      return { bg: 'brand.500' };
    case 'checked_in':
      return { bg: 'ink.500' };
    case 'awaiting_payment':
      return {
        bg: 'white',
        border: '1.5px dashed',
        borderColor: 'status.warn',
      };
    case 'external':
      return { bg: 'status.info' };
    case 'blocked':
      return { bg: '#E6E6E2' };
    default:
      return { bg: 'line.400' };
  }
}

export function CalendarLegend() {
  return (
    <Flex
      gap={{ base: '12px', md: '18px' }}
      px="20px"
      py="12px"
      borderBottom="1px solid"
      borderColor="line.500"
      bg="#FCFCFA"
      fontSize="13px"
      color="ink.400"
      wrap="wrap"
    >
      {CALENDAR_LEGEND.map((item) => (
        <Flex key={item.kind} align="center" gap="7px">
          <Box
            w="12px"
            h="12px"
            borderRadius="4px"
            flexShrink={0}
            {...getLegendSwatchStyles(item.kind)}
          />
          <Text>{item.label}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
