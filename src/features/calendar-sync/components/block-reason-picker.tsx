'use client';

import { Button, Flex } from '@chakra-ui/react';
import type { BlockReason } from '../types';
import { BLOCK_REASON_LABELS } from '../utils/calendar-sync-format';

/** Maintenance / Owner stay / Other as a segmented control. */
export function BlockReasonPicker({
  labelledBy,
  value,
  onChange,
}: {
  labelledBy: string;
  value: BlockReason;
  onChange: (reason: BlockReason) => void;
}) {
  return (
    <Flex
      role="radiogroup"
      aria-labelledby={labelledBy}
      display="inline-flex"
      p="3px"
      gap="2px"
      border="1px solid"
      borderColor="line.500"
      borderRadius="10px"
      bg="bg.400"
      maxW="100%"
      wrap="wrap"
    >
      {(Object.entries(BLOCK_REASON_LABELS) as Array<[BlockReason, string]>).map(([reason, label]) => {
        const selected = reason === value;
        return (
          <Button
            key={reason}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(reason)}
            variant="unstyled"
            h="32px"
            px="14px"
            borderRadius="8px"
            fontSize="13px"
            fontWeight={selected ? 700 : 500}
            color={selected ? 'ink.500' : 'ink.300'}
            bg={selected ? 'white' : 'transparent'}
            boxShadow={selected ? 'sm' : 'none'}
            _hover={{ color: 'ink.500' }}
          >
            {label}
          </Button>
        );
      })}
    </Flex>
  );
}
