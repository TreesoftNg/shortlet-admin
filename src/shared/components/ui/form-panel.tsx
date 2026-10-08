'use client';

import { Box, Flex, Stack, Text, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type FormPanelProps = Omit<BoxProps, 'title'> & {
  title?: ReactNode;
  description?: ReactNode;
  /** Shown on the right of the header, e.g. a switch or a link. */
  headerAction?: ReactNode;
  /** A grey strip under the content, e.g. a summary and the submit button. */
  footer?: ReactNode;
  children: ReactNode;
};

/**
 * A bordered card for a group of settings or a form: header, rows or a body,
 * and an optional footer strip.
 */
export function FormPanel({ title, description, headerAction, footer, children, ...boxProps }: FormPanelProps) {
  return (
    <Box border="1px solid" borderColor="line.500" borderRadius="14px" overflow="hidden" bg="white" {...boxProps}>
      {title ? (
        <Flex
          justify="space-between"
          align="flex-start"
          gap="16px"
          px="18px"
          py="14px"
          borderBottom="1px solid"
          borderColor="line.500"
        >
          <Box minW={0}>
            <Text fontSize="15px" fontWeight={700} color="ink.500">
              {title}
            </Text>
            {description ? (
              <Text fontSize="13px" color="ink.300" mt="2px">
                {description}
              </Text>
            ) : null}
          </Box>
          {headerAction}
        </Flex>
      ) : null}
      <Box>{children}</Box>
      {footer ? <FormPanelFooter>{footer}</FormPanelFooter> : null}
    </Box>
  );
}

/** Free-form content inside a panel (for forms that are not label/control rows). */
export function FormPanelBody({ children }: { children: ReactNode }) {
  return (
    <Stack spacing="18px" px="18px" py="18px">
      {children}
    </Stack>
  );
}

function FormPanelFooter({ children }: { children: ReactNode }) {
  return (
    <Flex
      px="18px"
      py="12px"
      gap="12px"
      align={{ base: 'stretch', md: 'center' }}
      justify="space-between"
      direction={{ base: 'column', md: 'row' }}
      borderTop="1px solid"
      borderColor="line.500"
      bg="bg.400"
      fontSize="13px"
      color="ink.400"
    >
      {children}
    </Flex>
  );
}

const labelStyle = { fontSize: '14px', fontWeight: 600, color: 'ink.500' } as const;

type FormRowProps = {
  label: ReactNode;
  /** id of the control, so clicking the label focuses it. */
  labelFor?: string;
  description?: ReactNode;
  error?: string;
  /** Indents a row that depends on the one above it. */
  nested?: boolean;
  /** Switches and badges stay beside the label on small screens. */
  isInline?: boolean;
  /** Puts the control under the label at every width (e.g. a textarea). */
  isStacked?: boolean;
  children: ReactNode;
};

/** One setting: label and description on the left, its control on the right. */
export function FormRow({
  label,
  labelFor,
  description,
  error,
  nested,
  isInline,
  isStacked,
  children,
}: FormRowProps) {
  const direction = isStacked ? 'column' : isInline ? 'row' : { base: 'column', md: 'row' };
  const align = isStacked ? 'stretch' : isInline ? 'center' : { base: 'stretch', md: 'center' };
  return (
    <Flex
      direction={direction as 'row'}
      align={align as 'center'}
      justify="space-between"
      gap={isStacked ? '10px' : { base: '10px', md: '24px' }}
      px="18px"
      py="14px"
      pl={nested ? { base: '18px', md: '34px' } : '18px'}
      borderTop="1px solid"
      borderColor="line.500"
      _first={{ borderTop: 0 }}
    >
      <Box minW={0} flex={isStacked ? undefined : '1'}>
        {labelFor ? (
          <Text as="label" htmlFor={labelFor} display="block" {...labelStyle}>
            {label}
          </Text>
        ) : (
          <Text {...labelStyle}>{label}</Text>
        )}
        {description ? (
          <Text fontSize="13px" color="ink.300" mt="2px">
            {description}
          </Text>
        ) : null}
        {error ? (
          <Text fontSize="13px" color="red.500" mt="4px" role="alert">
            {error}
          </Text>
        ) : null}
      </Box>
      {children}
    </Flex>
  );
}
