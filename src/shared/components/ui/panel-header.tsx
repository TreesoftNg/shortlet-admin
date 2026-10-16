'use client';

import { Box, Flex, Heading, Text, type FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type PanelHeaderProps = FlexProps & {
  title: string;
  /** Muted line under the title. */
  description?: ReactNode;
  actions?: ReactNode;
};

export function PanelHeader({ title, description, actions, children, ...rest }: PanelHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      mb="16px"
      gap="12px"
      wrap="wrap"
      {...rest}
    >
      <Box minW={0}>
        <Heading as="h3" fontSize={{ base: '16px', md: '18px' }} fontWeight={700}>
          {title}
        </Heading>
        {description ? (
          <Text fontSize="13px" color="ink.300" mt="2px">
            {description}
          </Text>
        ) : null}
      </Box>
      {actions ?? children}
    </Flex>
  );
}
