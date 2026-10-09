'use client';

import { Button, Flex, Input, InputGroup, InputRightAddon, Text, useToast } from '@chakra-ui/react';
import type { ChangeEvent } from 'react';

/** Inputs and selects shown on the right of a settings row. */
export const controlProps = {
  borderColor: 'line.500',
  borderRadius: '10px',
  h: '40px',
  bg: 'white',
  fontSize: '14px',
  w: { base: '100%', md: '320px' },
  flexShrink: 0,
} as const;

/** A number with its unit inside the field, e.g. "15 | minutes". */
export function UnitInput({
  id,
  label,
  unit,
  value,
  min,
  max,
  step = 1,
  isInvalid,
  isReadOnly,
  onChange,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  min: number;
  max: number;
  step?: number | string;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <InputGroup w={{ base: '100%', md: '168px' }} flexShrink={0}>
      <Input
        id={id}
        aria-label={label}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        isReadOnly={isReadOnly}
        isInvalid={isInvalid}
        h="40px"
        fontSize="14px"
        borderColor="line.500"
        borderRadius="10px"
        bg="white"
      />
      <InputRightAddon
        h="40px"
        minW="72px"
        justifyContent="center"
        borderColor="line.500"
        borderLeftWidth={0}
        borderRadius="0 10px 10px 0"
        bg="bg.400"
        color="ink.300"
        fontSize="13px"
      >
        {unit}
      </InputRightAddon>
    </InputGroup>
  );
}

/** Bottom bar of a settings tab: save state on the left, Save on the right. */
export function SaveBar({
  canManage,
  isSaving,
  isDirty,
  onSave,
}: {
  canManage: boolean;
  isSaving: boolean;
  isDirty: boolean;
  onSave: () => void;
}) {
  const highlight = canManage && isDirty;
  return (
    <Flex
      align={{ base: 'stretch', md: 'center' }}
      justify="space-between"
      direction={{ base: 'column', md: 'row' }}
      gap="12px"
      px="18px"
      py="12px"
      border="1px solid"
      borderColor="line.500"
      borderRadius="14px"
      bg="bg.400"
    >
      <Text fontSize="13px" color={highlight ? 'ink.500' : 'ink.300'} fontWeight={highlight ? 600 : 400}>
        {!canManage
          ? 'Only owners and admins can change these settings.'
          : isDirty
            ? 'You have unsaved changes.'
            : 'All changes saved.'}
      </Text>
      {canManage ? (
        <Button
          variant="dark"
          h="40px"
          px="18px"
          borderRadius="10px"
          w={{ base: '100%', md: 'auto' }}
          isLoading={isSaving}
          onClick={onSave}
        >
          Save changes
        </Button>
      ) : null}
    </Flex>
  );
}

/** Toasts used by every settings tab. */
export function useSettingsToasts() {
  const toast = useToast();
  return {
    saved: () => toast({ title: 'Settings saved', status: 'success', duration: 3000, isClosable: true }),
    invalid: () =>
      toast({ title: 'Please fix the highlighted fields', status: 'warning', duration: 4000, isClosable: true }),
    failed: (error: unknown) =>
      toast({
        title: 'Could not save',
        description: error instanceof Error ? error.message : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      }),
  };
}
