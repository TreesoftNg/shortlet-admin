'use client';

import { Flex, Text } from '@chakra-ui/react';
import { LuTriangleAlert } from 'react-icons/lu';
import type { CalendarEvent } from '../types';
import { getEventBarStyles } from './calendar-legend';

type CalendarEventBarProps = {
  event: CalendarEvent;
  leftPercent: number;
  widthCalc: string;
  onClick?: (event: CalendarEvent) => void;
};

/** One stay or block on a unit's row; opens its details when clicked. */
export function CalendarEventBar({ event, leftPercent, widthCalc, onClick }: CalendarEventBarProps) {
  const styles = getEventBarStyles(event.kind);
  const title = event.conflict ? `${event.label} — overlaps another stay` : event.label;

  return (
    <Flex
      as="button"
      type="button"
      aria-label={title}
      title={title}
      position="absolute"
      top="12px"
      left={`${leftPercent}%`}
      w={widthCalc}
      h="40px"
      borderRadius="10px"
      px="12px"
      align="center"
      gap="8px"
      fontSize="12px"
      fontWeight={700}
      zIndex={2}
      whiteSpace="nowrap"
      overflow="hidden"
      textAlign="left"
      cursor={onClick ? 'pointer' : 'default'}
      _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '2px' }}
      onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      onClick={() => onClick?.(event)}
      {...styles}
      {...(event.conflict ? { outline: '2px solid', outlineColor: 'status.danger' } : {})}
    >
      {event.conflict ? <LuTriangleAlert size={14} aria-hidden /> : null}
      {event.initials ? (
        <Flex
          w="22px"
          h="22px"
          borderRadius="full"
          bg="rgba(255,255,255,0.25)"
          align="center"
          justify="center"
          fontSize="10px"
          flexShrink={0}
        >
          {event.initials}
        </Flex>
      ) : null}
      <Text as="span" noOfLines={1}>
        {event.label}
      </Text>
    </Flex>
  );
}
