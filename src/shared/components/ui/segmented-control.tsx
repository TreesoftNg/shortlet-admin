'use client';

import { Button, Flex, type FlexProps } from '@chakra-ui/react';

export type SegmentedControlOption<T extends string> = { value: T; label: string };

export type SegmentedControlProps<T extends string> = Omit<FlexProps, 'onChange'> & {
  /** Accessible name of the group, e.g. "Period". */
  label: string;
  options: ReadonlyArray<SegmentedControlOption<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Stretch the options to fill the available width. */
  isFitted?: boolean;
};

/** A small single-choice switch, announced as a radio group. */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  isFitted = false,
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <Flex
      role="radiogroup"
      aria-label={label}
      bg="bg.400"
      border="1px solid"
      borderColor="line.500"
      borderRadius="10px"
      p="3px"
      gap="2px"
      flexShrink={0}
      {...rest}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            flex={isFitted ? 1 : undefined}
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
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </Flex>
  );
}
