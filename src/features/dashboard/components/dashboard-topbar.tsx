'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { LuBell, LuCalendar, LuMenu, LuPlus, LuSearch } from 'react-icons/lu';
import { useUiStore } from '@/shared/store/ui-store';

type DashboardTopbarProps = {
  greetingName: string;
  periodLabel: string;
};

export function DashboardTopbar({ greetingName, periodLabel }: DashboardTopbarProps) {
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
          <Text
            as="h1"
            fontSize={{ base: '22px', md: '26px' }}
            fontWeight={800}
            letterSpacing="-0.02em"
            lineHeight="1.2"
          >
            Good morning, {greetingName} 👋
          </Text>
          <Text color="ink.400" fontSize="14px" mt="4px">
            Here&apos;s what&apos;s happening across your properties today.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}
