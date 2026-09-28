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

      <Flex
        gap="10px"
        align="center"
        wrap="wrap"
        justify={{ base: 'stretch', lg: 'flex-end' }}
      >
        <InputGroup
          maxW={{ base: '100%', md: '300px' }}
          flex={{ base: '1 1 100%', md: '1 1 220px' }}
        >
          <InputLeftElement pointerEvents="none" h="44px" color="ink.300">
            <LuSearch size={16} />
          </InputLeftElement>
          <Input
            h="44px"
            pl="40px"
            bg="white"
            borderColor="line.500"
            borderRadius="12px"
            fontSize="14px"
            placeholder="Search bookings, guests…"
            _placeholder={{ color: 'ink.300' }}
          />
        </InputGroup>

        <Button
          h="44px"
          px="14px"
          variant="secondary"
          fontSize="13px"
          fontWeight={600}
          leftIcon={<LuCalendar size={16} />}
          flexShrink={0}
        >
          {periodLabel}
        </Button>

        <Box position="relative" display="inline-flex">
          <IconButton
            aria-label="Notifications"
            icon={<LuBell size={18} />}
            h="44px"
            w="44px"
            variant="secondary"
            borderRadius="12px"
            flexShrink={0}
          />
          <Box
            position="absolute"
            top="10px"
            right="11px"
            w="8px"
            h="8px"
            borderRadius="full"
            bg="status.danger"
            border="2px solid"
            borderColor="white"
            pointerEvents="none"
          />
        </Box>

        <Button
          h="44px"
          leftIcon={<LuPlus size={16} />}
          flex={{ base: '1 1 100%', sm: '0 0 auto' }}
        >
          New booking
        </Button>
      </Flex>
    </Flex>
  );
}
