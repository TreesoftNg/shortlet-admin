'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { LuBuilding2 } from 'react-icons/lu';
import {
  eachDateInRange,
  getBarLayout,
  getDayName,
  getDayNumber,
  groupUnitsByProperty,
  isWeekend,
} from '@/features/availability/utils/calendar';
import type { AvailabilityCalendar, CalendarBar } from '@/shared/types/hospitable';
import { CalendarEventBar } from './calendar-event-bar';

type AvailabilityCalendarGridProps = {
  data: AvailabilityCalendar;
  highlightedUnitId?: number | null;
};

function formatRate(amount: number, currency: string): string {
  if (currency === 'NGN') {
    return `₦${Math.round(amount / 1000)}k`;
  }
  return String(amount);
}

export function AvailabilityCalendarGrid({
  data,
  highlightedUnitId = null,
}: AvailabilityCalendarGridProps) {
  const dates = eachDateInRange(data.start_date, data.end_date);
  const groups = groupUnitsByProperty(data.units);
  const dayCount = dates.length;
  const unitColWidth = 220;
  const dayColMin = dayCount > 14 ? 56 : 72;
  const gridTemplateColumns = `${unitColWidth}px repeat(${dayCount}, minmax(${dayColMin}px, 1fr))`;
  const highlightRef = useRef<HTMLDivElement>(null);

  const barsByUnit = data.bars.reduce<Record<number, CalendarBar[]>>((acc, bar) => {
    if (!acc[bar.unit_id]) acc[bar.unit_id] = [];
    acc[bar.unit_id].push(bar);
    return acc;
  }, {});

  useEffect(() => {
    if (!highlightedUnitId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [highlightedUnitId, data.units]);

  return (
    <Box overflowX="auto">
      <Box minW={`${unitColWidth + dayCount * dayColMin}px`}>
        <Box
          display="grid"
          gridTemplateColumns={gridTemplateColumns}
          borderTop="1px solid"
          borderColor="line.500"
        >
          <Box
            py="10px"
            pl="20px"
            fontSize="12px"
            color="ink.300"
            fontWeight={600}
            borderBottom="1px solid"
            borderColor="line.500"
          >
            Unit
          </Box>

          {dates.map((date) => {
            const weekend = isWeekend(date);
            const isToday = date === data.today;

            return (
              <Box
                key={date}
                py="10px"
                textAlign="center"
                fontSize="12px"
                color="ink.300"
                fontWeight={600}
                borderBottom="1px solid"
                borderLeft="1px solid"
                borderColor="line.400"
                borderBottomColor="line.500"
                bg={isToday ? 'brand.50' : weekend ? '#FBFBF9' : 'white'}
              >
                {getDayName(date)}
                <Text
                  as="b"
                  display="block"
                  fontSize="16px"
                  color={isToday ? 'brand.500' : 'ink.500'}
                >
                  {getDayNumber(date)}
                </Text>
              </Box>
            );
          })}

          {groups.map((group) => (
            <Box key={group.propertyId} display="contents">
              <Flex
                gridColumn="1 / -1"
                px="20px"
                py="10px"
                bg="bg.400"
                fontSize="12px"
                fontWeight={800}
                textTransform="uppercase"
                letterSpacing="0.05em"
                color="ink.400"
                borderBottom="1px solid"
                borderColor="line.500"
                align="center"
                gap="8px"
              >
                <LuBuilding2 size={14} />
                {group.propertyName}
                <Text
                  as="span"
                  ml="auto"
                  fontWeight={600}
                  textTransform="none"
                  letterSpacing="0"
                >
                  {group.units.length} units
                </Text>
              </Flex>

              {group.units.map((unit) => {
                const unitBars = barsByUnit[unit.id] ?? [];
                const isHighlighted = highlightedUnitId === unit.id;

                return (
                  <Box key={unit.id} display="contents">
                    <Flex
                      ref={isHighlighted ? highlightRef : undefined}
                      id={isHighlighted ? `availability-unit-${unit.id}` : undefined}
                      px="20px"
                      h="64px"
                      direction="column"
                      justify="center"
                      borderBottom="1px solid"
                      borderColor="line.400"
                      borderLeft={isHighlighted ? '3px solid' : undefined}
                      borderLeftColor={isHighlighted ? 'brand.500' : undefined}
                      fontSize="14px"
                      bg={isHighlighted ? 'brand.50' : undefined}
                    >
                      <Text fontWeight={700}>{unit.name}</Text>
                      <Text fontSize="12px" color="ink.300">
                        {unit.subtitle}
                      </Text>
                    </Flex>

                    {dates.map((date) => {
                      const weekend = isWeekend(date);
                      const isToday = date === data.today;
                      const covering = unitBars.some(
                        (bar) => bar.start_date <= date && bar.end_date >= date,
                      );
                      const startingBars = unitBars.filter(
                        (bar) => bar.start_date === date,
                      );

                      return (
                        <Box
                          key={`${unit.id}-${date}`}
                          h="64px"
                          borderLeft="1px solid"
                          borderBottom="1px solid"
                          borderColor="line.400"
                          position="relative"
                          fontSize="11px"
                          color="ink.300"
                          p="6px"
                          textAlign="right"
                          bg={
                            isHighlighted
                              ? 'brand.50'
                              : isToday
                                ? 'rgba(14,124,107,0.05)'
                                : weekend
                                  ? '#FBFBF9'
                                  : 'white'
                          }
                        >
                          {!covering
                            ? formatRate(
                                data.nightly_rates[date] ?? 0,
                                data.currency,
                              )
                            : null}

                          {startingBars.map((bar) => {
                            const layout = getBarLayout(
                              bar.start_date,
                              bar.end_date,
                              dates,
                            );
                            if (!layout) return null;

                            return (
                              <CalendarEventBar
                                key={bar.id}
                                bar={bar}
                                leftPercent={layout.leftPercent}
                                widthCalc={layout.widthCalc}
                              />
                            );
                          })}
                        </Box>
                      );
                    })}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
