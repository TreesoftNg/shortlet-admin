'use client';

import { Box, Button, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import {
  getBarLayout,
  getDayName,
  getDayNumber,
  isWeekend,
} from '@/features/availability/utils/calendar';
import {
  getEventBarStyles,
  getLegendSwatchStyles,
} from '@/features/availability/components/calendar-legend';
import { EmptyState, ErrorState } from '@/shared/components/ui';
import { useBlocks, useImportedBookings } from '../hooks/use-calendar-sync-queries';
import type { UnitCalendarSummary } from '../types';
import { errorMessage } from '../utils/calendar-sync-format';
import {
  buildTimelineBars,
  buildTimelineWindow,
  defaultTimelineAnchor,
  formatTimelineMonthLabel,
  shiftAnchorDate,
  type TimelineBar,
  type TimelineBarKind,
} from '../utils/unit-timeline';

const DAY_MIN = 44;

type TimelineTabProps = {
  unit: UnitCalendarSummary;
  /** Override for tests; defaults to today in the unit timezone. */
  initialAnchorDate?: string;
};

/** Mini day grid of Hospitable bookings + local blocks for one unit. */
export function TimelineTab({ unit, initialAnchorDate }: TimelineTabProps) {
  const [anchorDate, setAnchorDate] = useState(
    () => initialAnchorDate ?? defaultTimelineAnchor(unit.timezone),
  );
  const bookings = useImportedBookings(unit.unitId, 'all');
  const blocks = useBlocks(unit.unitId);

  const window = useMemo(() => buildTimelineWindow(anchorDate, 28), [anchorDate]);
  const today = defaultTimelineAnchor(unit.timezone);

  const bars = useMemo(() => {
    if (!bookings.data || !blocks.data) return [];
    return buildTimelineBars(bookings.data, blocks.data, window);
  }, [blocks.data, bookings.data, window]);

  const isPending = bookings.isPending || blocks.isPending;
  const isError = bookings.isError || blocks.isError;
  const error = bookings.error ?? blocks.error;

  return (
    <Stack spacing="14px" fontSize="14px">
      <Text color="ink.400">
        Imported Hospitable stays and blocked dates for four weeks. Use the arrows to look ahead.
      </Text>

      <Flex justify="space-between" align="center" gap="10px" wrap="wrap">
        <Flex gap="6px">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<LuChevronLeft size={16} />}
            onClick={() => setAnchorDate((current) => shiftAnchorDate(current, -7))}
          >
            Prev week
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAnchorDate(today)}
            isDisabled={anchorDate === today}
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="secondary"
            rightIcon={<LuChevronRight size={16} />}
            onClick={() => setAnchorDate((current) => shiftAnchorDate(current, 7))}
          >
            Next week
          </Button>
        </Flex>
        <Text fontWeight={700}>
          {formatTimelineMonthLabel(window.startDate, window.endDate)}
        </Text>
      </Flex>

      <TimelineLegend />

      {isPending ? (
        <Flex justify="center" py="32px">
          <Spinner color="brand.500" />
        </Flex>
      ) : isError ? (
        <ErrorState
          minH="180px"
          message={errorMessage(error)}
          onRetry={() => {
            void bookings.refetch();
            void blocks.refetch();
          }}
        />
      ) : !unit.feed && bars.length === 0 ? (
        <EmptyState
          minH="160px"
          title="Nothing to show yet"
          description="Connect Hospitable import or add blocked dates to see them on the timeline."
        />
      ) : (
        <UnitTimelineGrid dates={window.dates} bars={bars} today={today} />
      )}
    </Stack>
  );
}

function TimelineLegend() {
  const items: Array<{ kind: TimelineBarKind; label: string }> = [
    { kind: 'external', label: 'Hospitable booking' },
    { kind: 'blocked', label: 'Blocked' },
    { kind: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <Flex gap="14px" wrap="wrap" fontSize="13px" color="ink.400">
      {items.map((item) => (
        <Flex key={item.kind} align="center" gap="7px">
          <Box
            w="12px"
            h="12px"
            borderRadius="4px"
            flexShrink={0}
            {...legendStyles(item.kind)}
          />
          <Text>{item.label}</Text>
        </Flex>
      ))}
    </Flex>
  );
}

function legendStyles(kind: TimelineBarKind) {
  if (kind === 'cancelled') {
    return {
      bg: 'white',
      border: '1.5px dashed',
      borderColor: 'ink.300',
    };
  }
  return getLegendSwatchStyles(kind === 'external' ? 'external' : 'blocked');
}

function barStyles(kind: TimelineBarKind) {
  if (kind === 'cancelled') {
    return {
      bg: 'white',
      color: 'ink.300',
      border: '1.5px dashed',
      borderColor: 'ink.300',
    };
  }
  return getEventBarStyles(kind === 'external' ? 'external' : 'blocked');
}

function UnitTimelineGrid({
  dates,
  bars,
  today,
}: {
  dates: string[];
  bars: TimelineBar[];
  today: string;
}) {
  const dayCount = dates.length;
  const gridTemplateColumns = `repeat(${dayCount}, minmax(${DAY_MIN}px, 1fr))`;
  const barsByStart = bars.reduce<Record<string, TimelineBar[]>>((acc, bar) => {
    if (!acc[bar.startDate]) acc[bar.startDate] = [];
    acc[bar.startDate].push(bar);
    return acc;
  }, {});

  return (
    <Box
      overflowX="auto"
      border="1px solid"
      borderColor="line.500"
      borderRadius="14px"
    >
      <Box minW={`${dayCount * DAY_MIN}px`}>
        <Box
          display="grid"
          gridTemplateColumns={gridTemplateColumns}
          borderBottom="1px solid"
          borderColor="line.500"
          bg="#FCFCFA"
        >
          {dates.map((date) => {
            const weekend = isWeekend(date);
            const isToday = date === today;
            return (
              <Box
                key={date}
                py="8px"
                textAlign="center"
                bg={weekend ? 'bg.400' : undefined}
                borderLeft="1px solid"
                borderColor="line.500"
                position="relative"
              >
                {isToday ? (
                  <Box
                    position="absolute"
                    top="0"
                    left="50%"
                    transform="translateX(-50%)"
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg="brand.500"
                  />
                ) : null}
                <Text fontSize="11px" color="ink.300" fontWeight={600}>
                  {getDayName(date)}
                </Text>
                <Text
                  fontSize="13px"
                  fontWeight={700}
                  color={isToday ? 'brand.500' : 'ink.500'}
                >
                  {getDayNumber(date)}
                </Text>
              </Box>
            );
          })}
        </Box>

        <Box display="grid" gridTemplateColumns={gridTemplateColumns} h="72px">
          {dates.map((date) => {
            const starting = barsByStart[date] ?? [];
            return (
              <Box
                key={date}
                borderLeft="1px solid"
                borderColor="line.500"
                bg={isWeekend(date) ? 'bg.400' : 'white'}
                position="relative"
              >
                {starting.map((bar) => {
                  const layout = getBarLayout(bar.startDate, bar.endDate, dates);
                  if (!layout) return null;
                  const styles = barStyles(bar.kind);

                  return (
                    <Flex
                      key={bar.id}
                      position="absolute"
                      top="16px"
                      left={`${layout.leftPercent}%`}
                      w={layout.widthCalc}
                      h="40px"
                      borderRadius="10px"
                      px="10px"
                      align="center"
                      gap="6px"
                      fontSize="12px"
                      fontWeight={700}
                      zIndex={2}
                      whiteSpace="nowrap"
                      overflow="hidden"
                      title={bar.label}
                      {...styles}
                    >
                      {bar.initials ? (
                        <Flex
                          w="20px"
                          h="20px"
                          borderRadius="full"
                          bg="rgba(255,255,255,0.25)"
                          align="center"
                          justify="center"
                          fontSize="10px"
                          flexShrink={0}
                        >
                          {bar.initials}
                        </Flex>
                      ) : null}
                      <Text as="span" noOfLines={1}>
                        {bar.label}
                      </Text>
                    </Flex>
                  );
                })}
              </Box>
            );
          })}
        </Box>

        {bars.length === 0 ? (
          <Flex
            justify="center"
            py="18px"
            borderTop="1px solid"
            borderColor="line.500"
            color="ink.300"
            fontSize="13px"
          >
            No stays or blocks in this window
          </Flex>
        ) : null}
      </Box>
    </Box>
  );
}
