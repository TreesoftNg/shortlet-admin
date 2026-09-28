'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { CalendarBar } from '@/shared/types/hospitable';
import { getEventBarStyles } from './calendar-legend';

type CalendarEventBarProps = {
  bar: CalendarBar;
  leftPercent: number;
  widthCalc: string;
};

export function CalendarEventBar({
  bar,
  leftPercent,
  widthCalc,
}: CalendarEventBarProps) {
  const styles = getEventBarStyles(bar.kind);

  return (
    <Flex
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
      title={bar.label}
      {...styles}
    >
      {bar.initials ? (
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
          {bar.initials}
        </Flex>
      ) : null}
      <Text as="span" noOfLines={1}>
        {bar.label}
      </Text>
    </Flex>
  );
}
