'use client';

import { Flex, Heading, type FlexProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type PanelHeaderProps = FlexProps & {
  title: string;
  actions?: ReactNode;
};

export function PanelHeader({ title, actions, children, ...rest }: PanelHeaderProps) {
  return (
    <Flex
      justify="space-between"
      align="center"
      mb="16px"
      gap="12px"
      wrap="wrap"
      {...rest}
    >
      <Heading as="h3" fontSize={{ base: '16px', md: '18px' }} fontWeight={700}>
        {title}
      </Heading>
      {actions ?? children}
    </Flex>
  );
}
