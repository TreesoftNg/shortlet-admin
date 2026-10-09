'use client';

import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Panel, StatusBadge } from '@/shared/components/ui';
import type { TodayMovement } from '../types';

type TodayPanelProps = {
  date: string;
  checkIns: TodayMovement[];
  checkOuts: TodayMovement[];
};

const todayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

/** Guests arriving and leaving today. */
export function TodayPanel({ date, checkIns, checkOuts }: TodayPanelProps) {
  return (
    <Panel h="100%">
      <Heading as="h3" fontSize={{ base: '16px', md: '18px' }} fontWeight={700}>
        Today
      </Heading>
      <Text fontSize="13px" color="ink.300" mt="2px" mb="16px">
        {todayFormat.format(new Date(`${date}T00:00:00Z`))}
      </Text>
      <MovementList title="Check-ins" items={checkIns} empty="No arrivals today." />
      <Box h="16px" />
      <MovementList title="Check-outs" items={checkOuts} empty="No departures today." />
    </Panel>
  );
}

function MovementList({ title, items, empty }: { title: string; items: TodayMovement[]; empty: string }) {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb="8px">
        <Text fontSize="12px" fontWeight={700} textTransform="uppercase" letterSpacing="0.05em" color="ink.300">
          {title}
        </Text>
        <Text fontSize="12px" fontWeight={700} color="ink.400">
          {items.length}
        </Text>
      </Flex>
      {items.length === 0 ? (
        <Text fontSize="13px" color="ink.300">
          {empty}
        </Text>
      ) : (
        <Flex direction="column" gap="8px">
          {items.map((item) => (
            <Flex
              key={`${item.bookingId ?? item.reference ?? item.guestName}-${item.unitId}`}
              align="center"
              gap="10px"
              border="1px solid"
              borderColor="line.500"
              borderRadius="12px"
              px="12px"
              py="10px"
            >
              <Text fontFamily="mono" fontSize="13px" fontWeight={700} color="ink.400" minW="44px">
                {item.time}
              </Text>
              <Box flex="1" minW={0}>
                <Text fontSize="14px" fontWeight={600} noOfLines={1}>
                  {item.guestName}
                </Text>
                <Text fontSize="12px" color="ink.300" noOfLines={1}>
                  {item.propertyName ? `${item.propertyName} · ${item.unitName}` : item.unitName}
                </Text>
              </Box>
              {item.source === 'imported' ? <StatusBadge tone="info">Airbnb / Booking.com</StatusBadge> : null}
            </Flex>
          ))}
        </Flex>
      )}
    </Box>
  );
}
