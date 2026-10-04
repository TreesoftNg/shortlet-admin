'use client';

import { Avatar, Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import type { Customer } from '@/features/customers/types';
import { StatusBadge } from '@/shared/components/ui';
import { isReturningGuest } from '../utils/customer-filters';

type CustomerDetailDrawerProps = {
  customer: Customer | null;
};

export function CustomerDetailDrawer({ customer }: CustomerDetailDrawerProps) {
  if (!customer) {
    return null;
  }

  return (
    <Box>
      <Flex gap="16px" align="center" mb="24px">
        <Avatar size="xl" name={customer.fullName} src={customer.pictureUrl ?? undefined} />
        <Box minW={0} flex="1">
          <Heading
            as="h3"
            fontSize={{ base: '22px', md: '26px' }}
            fontWeight={800}
            letterSpacing="-0.02em"
            noOfLines={1}
          >
            {customer.fullName || '—'}
          </Heading>
          <Text color="ink.400" fontSize="15px" mt="4px" noOfLines={1}>
            {customer.location ?? 'Unknown location'}
          </Text>
        </Box>
        <StatusBadge tone={isReturningGuest(customer) ? 'brand' : 'mute'}>
          {isReturningGuest(customer) ? 'Guest' : 'New'}
        </StatusBadge>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap="12px" mb="24px">
        <StatChip label="Stays" value={String(customer.staysCount)} />
        <StatChip
          label="Spent"
          value={
            customer.totalSpent > 0
              ? formatMoney(customer.totalSpent, customer.currency)
              : '—'
          }
        />
        <StatChip label="Upcoming" value={String(customer.upcomingStays)} />
        <StatChip label="Locale" value={customer.locale ?? '—'} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px" mb="24px">
        <DetailCard label="Email" value={customer.email || '—'} />
        <DetailCard label="Phone" value={customer.phone ?? '—'} />
      </SimpleGrid>

      <Box>
        <Text
          fontSize="12px"
          textTransform="uppercase"
          letterSpacing="0.05em"
          color="ink.300"
          fontWeight={700}
          mb="12px"
        >
          Recent stays
        </Text>
        <Text fontSize="15px" color="ink.300">
          No bookings yet
        </Text>
      </Box>
    </Box>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="14px" px="16px" py="14px">
      <Text fontSize="11px" color="ink.300" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="16px" fontWeight={700} mt="4px">
        {value}
      </Text>
    </Box>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="14px" px="16px" py="14px">
      <Text fontSize="11px" color="ink.300" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="22px" fontWeight={800} mt="4px" noOfLines={1}>
        {value}
      </Text>
    </Box>
  );
}
