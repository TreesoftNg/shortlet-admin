'use client';

import { Box, Button, Flex, Heading, Text, type BoxProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuInbox } from 'react-icons/lu';

export type EmptyStateProps = BoxProps & {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
};

/** Centered empty state for list/detail sections with no data. */
export function EmptyState({
  title = 'Nothing here yet',
  description = 'There is no data to show for this section.',
  icon,
  action,
  ...rest
}: EmptyStateProps) {
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
        color="ink.300"
        mb="16px"
      >
        {icon ?? <LuInbox size={24} />}
      </Flex>
      <Heading as="h3" fontSize="18px" fontWeight={800} mb="6px">
        {title}
      </Heading>
      <Text color="ink.300" fontSize="14px" maxW="360px" mb={action ? '18px' : 0}>
        {description}
      </Text>
      {action}
    </Flex>
  );
}

export type EmptyStateActionButtonProps = {
  children: ReactNode;
  onClick?: () => void;
};

export function EmptyStateActionButton({
  children,
  onClick,
}: EmptyStateActionButtonProps) {
  return (
    <Button variant="secondary" h="40px" borderRadius="12px" onClick={onClick}>
      {children}
    </Button>
  );
}
