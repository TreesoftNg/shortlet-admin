'use client';

import { Button, Flex } from '@chakra-ui/react';
import type { RevenuePeriod } from '@/shared/types/hospitable';

const PERIODS: Array<{ value: RevenuePeriod; label: string }> = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
];

type PeriodSegmentProps = {
  value: RevenuePeriod;
  onChange: (period: RevenuePeriod) => void;
};

export function PeriodSegment({ value, onChange }: PeriodSegmentProps) {
  return (
    <Flex bg="bg.400" borderRadius="10px" p="3px" gap="2px" flexShrink={0}>
      {PERIODS.map((period) => {
        const active = period.value === value;

        return (
          <Button
            key={period.value}
            type="button"
            size="sm"
            h="auto"
            minW="auto"
            px="12px"
            py="6px"
            borderRadius="8px"
            fontSize="13px"
            fontWeight={700}
            variant="unstyled"
            bg={active ? 'white' : 'transparent'}
            color={active ? 'ink.500' : 'ink.300'}
            boxShadow={active ? '0 1px 2px rgba(0,0,0,.08)' : 'none'}
            onClick={() => onChange(period.value)}
          >
            {period.label}
          </Button>
        );
      })}
    </Flex>
  );
}
