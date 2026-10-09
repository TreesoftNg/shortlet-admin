'use client';

import { Box, Flex, Tag, Text } from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuBuilding2 } from 'react-icons/lu';
import {
  addDays,
  coversNight,
  getDayName,
  getDayNumber,
  getEventLayout,
  groupUnitsByProperty,
  isWeekend,
  selectNights,
} from '@/features/availability/utils/calendar';
import type { AvailabilityCalendar, CalendarEvent, CalendarUnitRow, NightSelection } from '../types';
import { CalendarEventBar } from './calendar-event-bar';

type AvailabilityCalendarGridProps = {
  data: AvailabilityCalendar;
  highlightedUnitId?: string | null;
  /** Nights currently picked (shown highlighted). */
  selection?: NightSelection | null;
  /** Called while dragging across free nights of one unit. */
  onSelectionChange?: (selection: NightSelection | null) => void;
  onEventClick?: (event: CalendarEvent) => void;
};

const STATUS_LABELS: Partial<Record<CalendarUnitRow['status'], string>> = {
  maintenance: 'Maintenance',
  closed: 'Closed',
};

/** `85000.00` → `₦85k`; a unit without a base rate shows a dash. */
export function formatRate(amount: string | null, currency: string): string {
  if (amount === null) return '—';
  const value = Number(amount);
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  if (value >= 1000) return `${symbol}${Math.round(value / 1000)}k`;
  return `${symbol}${Math.round(value)}`;
}

export function AvailabilityCalendarGrid({
  data,
  highlightedUnitId = null,
  selection = null,
  onSelectionChange,
  onEventClick,
}: AvailabilityCalendarGridProps) {
  const nights = useMemo(() => {
    const list: string[] = [];
    for (let night = data.from; night < data.to; night = addDays(night, 1)) list.push(night);
    return list;
  }, [data.from, data.to]);
  const groups = useMemo(() => groupUnitsByProperty(data.units), [data.units]);
  const eventsByUnit = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of data.events) {
      map.set(event.unitId, [...(map.get(event.unitId) ?? []), event]);
    }
    return map;
  }, [data.events]);

  const [dragAnchor, setDragAnchor] = useState<{ unitId: string; night: string } | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const dayCount = nights.length;
  const unitColWidth = 220;
  const dayColMin = dayCount > 14 ? 56 : 72;
  const gridTemplateColumns = `${unitColWidth}px repeat(${dayCount}, minmax(${dayColMin}px, 1fr))`;
  const selectable = Boolean(onSelectionChange);

  useEffect(() => {
    if (!highlightedUnitId || !highlightRef.current) return;
    highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightedUnitId, data.units]);

  // Finish a drag even if the mouse is released outside the grid.
  useEffect(() => {
    if (!dragAnchor) return;
    const stop = () => setDragAnchor(null);
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, [dragAnchor]);

  const isFree = (unitId: string) => (night: string) =>
    night >= data.today && !(eventsByUnit.get(unitId) ?? []).some((event) => coversNight(event, night));

  const startDrag = (unit: CalendarUnitRow, night: string) => {
    if (!selectable || !isFree(unit.id)(night)) return;
    setDragAnchor({ unitId: unit.id, night });
    onSelectionChange?.({ unitId: unit.id, startDate: night, endDate: addDays(night, 1) });
  };

  const extendDrag = (unit: CalendarUnitRow, night: string) => {
    if (!dragAnchor || dragAnchor.unitId !== unit.id) return;
    const range = selectNights(dragAnchor.night, night, isFree(unit.id));
    if (range) onSelectionChange?.({ unitId: unit.id, ...range });
  };

  return (
    <Box overflowX="auto" userSelect={dragAnchor ? 'none' : undefined}>
      <Box minW={`${unitColWidth + dayCount * dayColMin}px`} role="grid" aria-label="Availability by unit and night">
        <Box display="grid" gridTemplateColumns={gridTemplateColumns} borderTop="1px solid" borderColor="line.500">
          <Box py="10px" pl="20px" fontSize="12px" color="ink.300" fontWeight={600} borderBottom="1px solid" borderColor="line.500">
            Unit
          </Box>

          {nights.map((night) => {
            const isToday = night === data.today;
            return (
              <Box
                key={night}
                py="10px"
                textAlign="center"
                fontSize="12px"
                color="ink.300"
                fontWeight={600}
                borderBottom="1px solid"
                borderLeft="1px solid"
                borderColor="line.400"
                borderBottomColor="line.500"
                bg={isToday ? 'brand.50' : isWeekend(night) ? '#FBFBF9' : 'white'}
              >
                {getDayName(night)}
                <Text as="b" display="block" fontSize="16px" color={isToday ? 'brand.500' : 'ink.500'}>
                  {getDayNumber(night)}
                </Text>
              </Box>
            );
          })}

          {groups.map((group) => (
            <Box key={group.key} display="contents">
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
                <Text as="span" ml="auto" fontWeight={600} textTransform="none" letterSpacing="0">
                  {group.units.length} {group.units.length === 1 ? 'unit' : 'units'}
                </Text>
              </Flex>

              {group.units.map((unit) => {
                const unitEvents = eventsByUnit.get(unit.id) ?? [];
                const isHighlighted = highlightedUnitId === unit.id;
                const statusLabel = STATUS_LABELS[unit.status];

                return (
                  <Box key={unit.id} display="contents" role="row" data-testid={`unit-row-${unit.id}`}>
                    <Flex
                      ref={isHighlighted ? highlightRef : undefined}
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
                      role="rowheader"
                    >
                      <Flex align="center" gap="6px" minW={0}>
                        <Text fontWeight={700} noOfLines={1}>
                          {unit.name}
                        </Text>
                        {statusLabel ? (
                          <Tag size="sm" colorScheme="orange" flexShrink={0}>
                            {statusLabel}
                          </Tag>
                        ) : null}
                      </Flex>
                      <Text fontSize="12px" color="ink.300" noOfLines={1}>
                        {[unit.subtitle, unit.openForBooking ? null : 'Not on website'].filter(Boolean).join(' · ')}
                      </Text>
                    </Flex>

                    {nights.map((night, index) => {
                      const isToday = night === data.today;
                      const isPast = night < data.today;
                      const covered = unitEvents.some((event) => coversNight(event, night));
                      const selected =
                        selection?.unitId === unit.id && selection.startDate <= night && night < selection.endDate;
                      const startingEvents = unitEvents.filter(
                        (event) => getEventLayout(event.startDate, event.endDate, nights)?.startIndex === index,
                      );
                      const canPick = selectable && !isPast && !covered;

                      return (
                        <Box
                          key={`${unit.id}-${night}`}
                          role="gridcell"
                          aria-selected={selected || undefined}
                          aria-label={`${unit.name}, ${night}`}
                          data-night={night}
                          h="64px"
                          borderLeft="1px solid"
                          borderBottom="1px solid"
                          borderColor="line.400"
                          position="relative"
                          fontSize="11px"
                          color={isPast ? '#B5B9BD' : 'ink.300'}
                          p="6px"
                          textAlign="right"
                          cursor={canPick ? 'cell' : 'default'}
                          onMouseDown={() => startDrag(unit, night)}
                          onMouseEnter={() => extendDrag(unit, night)}
                          bg={
                            selected
                              ? 'brand.100'
                              : isHighlighted
                                ? 'brand.50'
                                : isPast
                                  ? '#F6F6F3'
                                  : isToday
                                    ? 'rgba(14,124,107,0.05)'
                                    : isWeekend(night)
                                      ? '#FBFBF9'
                                      : 'white'
                          }
                        >
                          {!covered ? formatRate(unit.rates[night] ?? null, data.currency) : null}

                          {startingEvents.map((event) => {
                            const layout = getEventLayout(event.startDate, event.endDate, nights);
                            if (!layout) return null;
                            return (
                              <CalendarEventBar
                                key={event.id}
                                event={event}
                                leftPercent={layout.leftPercent}
                                widthCalc={layout.widthCalc}
                                onClick={onEventClick}
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
