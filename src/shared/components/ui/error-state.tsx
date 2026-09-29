'use client';

import { Button, Flex, Heading, Text, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuCircleAlert, LuRefreshCw } from 'react-icons/lu';

export type ErrorStateProps = BoxProps & {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
};

/** Centered error display with optional retry action. */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this section. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  icon,
  ...rest
}: ErrorStateProps) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      minH="280px"
      px="24px"
      py="40px"
      {...rest}
    >
      <Flex
        w="56px"
        h="56px"
        borderRadius="16px"
        align="center"
        justify="center"
        bg="bg.400"
        color="status.danger"
        mb="16px"
      >
        {icon ?? <LuCircleAlert size={24} />}
      </Flex>
      <Heading as="h3" fontSize="18px" fontWeight={800} mb="6px">
        {title}
      </Heading>
      <Text color="ink.300" fontSize="14px" maxW="400px" mb={onRetry ? '18px' : 0}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          variant="secondary"
          h="40px"
          borderRadius="12px"
          leftIcon={<LuRefreshCw size={16} />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      ) : null}
    </Flex>
  );
}
