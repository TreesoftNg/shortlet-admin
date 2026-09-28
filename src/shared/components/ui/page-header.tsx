'use client';

import { Box, Flex, Heading, Text, type FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type PageHeaderProps = FlexProps & {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  description,
  actions,
  children,
  ...rest
}: PageHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align={{ base: 'stretch', md: 'center' }}
      direction={{ base: 'column', md: 'row' }}
      gap="16px"
      mb="26px"
      {...rest}
    >
      <Box>
        <Heading
          as="h1"
          fontSize={{ base: '22px', md: '26px' }}
          fontWeight={800}
          letterSpacing="-0.02em"
        >
          {title}
        </Heading>
        {description ? (
          <Text color="ink.400" fontSize="14px" mt="4px">
            {description}
          </Text>
        ) : null}
      </Box>
      {(actions || children) && (
        <Flex gap="10px" wrap="wrap" align="center">
          {actions ?? children}
        </Flex>
      )}
    </Flex>
  );
}
