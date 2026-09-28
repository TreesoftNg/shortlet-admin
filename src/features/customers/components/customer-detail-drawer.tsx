'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { LuMessageCircle } from 'react-icons/lu';
import {
  formatMoney,
  formatStayDates,
  getReservationDisplayStatus,
} from '@/features/bookings/utils/reservation-display';
import type { CustomerListItem } from '@/features/customers/utils/customer-filters';
import { mockReservations } from '@/mocks/data';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';

type CustomerDetailDrawerProps = {
  customer: CustomerListItem | null;
};

export function CustomerDetailDrawer({ customer }: CustomerDetailDrawerProps) {
  if (!customer) {
    return (
      <Box
        bg="white"
        border="1px solid"
        borderColor="line.500"
        borderRadius="22px"
        p="24px"
        color="ink.300"
        fontSize="14px"
      >
        Select a customer to see details.
      </Box>
    );
  }

  const stays = mockReservations.filter(
    (reservation) => reservation.guest?.id === customer.id,
  );

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="22px"
      overflow="hidden"
      alignSelf="start"
      position={{ xl: 'sticky' }}
      top={{ xl: '28px' }}
    >
      <Box px="22px" py="20px">
        <Flex gap="12px" align="center" mb="16px">
          <Avatar
            size="lg"
            name={customer.full_name ?? undefined}
            src={customer.picture_url ?? undefined}
          />
          <Box minW={0} flex="1">
            <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
              {customer.full_name ?? '—'}
            </Heading>
            <Text color="ink.400" fontSize="13px" noOfLines={1}>
              {customer.location ?? 'Unknown location'}
            </Text>
          </Box>
          <StatusBadge tone={customer.stays_count > 0 ? 'brand' : 'mute'}>
            {customer.stays_count > 0 ? 'Guest' : 'New'}
          </StatusBadge>
        </Flex>

        <SimpleGrid columns={2} gap="10px" mb="4px">
          <StatChip label="Stays" value={String(customer.stays_count)} />
          <StatChip
            label="Spent"
            value={
              customer.total_spent > 0
                ? formatMoney(customer.total_spent, customer.currency)
                : '—'
            }
          />
        </SimpleGrid>

        <KeyValueList
          title="Contact"
          items={[
            {
              label: 'Email',
              value: <Text as="b">{customer.email ?? '—'}</Text>,
            },
            {
              label: 'Phone',
              value: <Text as="b">{customer.phone ?? '—'}</Text>,
            },
            {
              label: 'Locale',
              value: <Text as="b">{customer.locale ?? '—'}</Text>,
            },
            {
              label: 'Upcoming',
              value: <Text as="b">{customer.upcoming_stays}</Text>,
            },
          ]}
        />

        <Box py="16px" borderTop="1px solid" borderColor="line.500">
          <Text
            fontSize="12px"
            textTransform="uppercase"
            letterSpacing="0.05em"
            color="ink.300"
            fontWeight={700}
            mb="10px"
          >
            Recent stays
          </Text>
          {stays.length === 0 ? (
            <Text fontSize="14px" color="ink.300">
              No bookings yet
            </Text>
          ) : (
            stays.slice(0, 4).map((reservation) => {
              const status = getReservationDisplayStatus(reservation);
              return (
                <Flex
                  key={reservation.id}
                  justify="space-between"
                  align="flex-start"
                  gap="10px"
                  py="10px"
                  borderBottom="1px solid"
                  borderColor="line.400"
                  _last={{ borderBottom: 0 }}
                >
                  <Box minW={0}>
                    <Text fontWeight={700} fontSize="14px" noOfLines={1}>
                      {reservation.property?.name ?? 'Property'}
                    </Text>
                    <Text color="ink.300" fontSize="12px">
                      {formatStayDates(
                        reservation.arrival_date,
                        reservation.departure_date,
                      )}
                    </Text>
                  </Box>
                  <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                </Flex>
              );
            })
          )}
        </Box>

        <Flex gap="8px" mt="4px" wrap="wrap">
          <Button
            size="sm"
            variant="dark"
            flex="1"
            minW="120px"
            leftIcon={<LuMessageCircle size={14} />}
          >
            Message
          </Button>
          <Button size="sm" variant="soft">
            View bookings
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="12px" px="12px" py="10px">
      <Text
        fontSize="11px"
        color="ink.300"
        fontWeight={700}
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="18px" fontWeight={800} mt="2px" noOfLines={1}>
        {value}
      </Text>
    </Box>
  );
}
