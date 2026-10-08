'use client';

import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useUiStore } from '@/shared/store/ui-store';
import { greetingFor } from '../utils/report-format';

type DashboardTopbarProps = {
  firstName: string | null;
  subtitle: string;
  actions?: ReactNode;
};

export function DashboardTopbar({ firstName, subtitle, actions }: DashboardTopbarProps) {
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  return (
    <Flex
      justify="space-between"
      align={{ base: 'stretch', lg: 'center' }}
      direction={{ base: 'column', lg: 'row' }}
      gap="16px"
      mb="26px"
    >
      <Flex align="flex-start" gap="12px">
        <IconButton
          aria-label="Open navigation"
          icon={<LuMenu size={20} />}
          display={{ base: 'inline-flex', lg: 'none' }}
          variant="secondary"
          borderRadius="12px"
          onClick={openMobileNav}
        />
        <Box>
          <Text as="h1" fontSize={{ base: '22px', md: '26px' }} fontWeight={800} letterSpacing="-0.02em" lineHeight="1.2">
            {greetingFor()}
            {firstName ? `, ${firstName}` : ''}
          </Text>
          <Text color="ink.400" fontSize="14px" mt="4px">
            {subtitle}
          </Text>
        </Box>
      </Flex>
      {actions ? <Flex align="center">{actions}</Flex> : null}
    </Flex>
  );
}
