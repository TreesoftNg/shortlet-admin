'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Text,
  useToast,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { ApiClientError } from '@/shared/api/types';

export const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '44px',
  bg: 'white',
} as const;

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="12px"
        fontWeight={800}
        textTransform="uppercase"
        letterSpacing="0.05em"
        color="ink.300"
        mb={description ? '4px' : '12px'}
      >
        {title}
      </Text>
      {description ? (
        <Text fontSize="13px" color="ink.300" mb="12px">
          {description}
        </Text>
      ) : null}
      {children}
    </Box>
  );
}

export function Field({
  label,
  children,
  error,
  helper,
  isRequired,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  helper?: string;
  isRequired?: boolean;
}) {
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
        {label}
      </FormLabel>
      {children}
      {helper && !error ? <FormHelperText color="ink.300">{helper}</FormHelperText> : null}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}

/** Save button for a settings tab; hidden for staff who cannot change settings. */
export function SaveBar({
  canManage,
  isSaving,
  onSave,
}: {
  canManage: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  if (!canManage) {
    return (
      <Text fontSize="13px" color="ink.300">
        Only owners and admins can change these settings.
      </Text>
    );
  }
  return (
    <Flex>
      <Button variant="dark" borderRadius="12px" h="40px" isLoading={isSaving} onClick={onSave}>
        Save changes
      </Button>
    </Flex>
  );
}

/** Field errors the API returned (VALIDATION_ERROR `details.fields`), first message each. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiClientError)) return {};
  const fields = (error.details?.fields ?? {}) as Record<string, string[]>;
  return Object.fromEntries(Object.entries(fields).map(([field, messages]) => [field, messages[0] ?? '']));
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
