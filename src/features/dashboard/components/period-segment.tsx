'use client';

import { Button, Flex } from '@chakra-ui/react';
import type { ReportPeriod } from '../types';
import { PERIOD_OPTIONS } from '../utils/report-format';

type PeriodSegmentProps = {
  value: ReportPeriod;
  onChange: (period: ReportPeriod) => void;
};

/** 7D / 30D / 90D / 12M switch. */
export function PeriodSegment({ value, onChange }: PeriodSegmentProps) {
  return (
    <Flex
      role="radiogroup"
      aria-label="Period"
      bg="bg.400"
      border="1px solid"
      borderColor="line.500"
      borderRadius="10px"
      p="3px"
      gap="2px"
      flexShrink={0}
    >
      {PERIOD_OPTIONS.map((period) => {
        const active = period.value === value;
        return (
          <Button
            key={period.value}
            type="button"
            role="radio"
            aria-checked={active}
            h="32px"
            minW="auto"
            px="12px"
            borderRadius="8px"
            fontSize="13px"
            fontWeight={700}
            variant="unstyled"
            bg={active ? 'white' : 'transparent'}
            color={active ? 'ink.500' : 'ink.300'}
            boxShadow={active ? 'sm' : 'none'}
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </Button>
        );
      })}
    </Flex>
  );
}
