'use client';

import { Avatar, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui';
import type { CustomerListItem } from '../utils/customer-filters';

export function getCustomerColumns(): DataTableColumn<CustomerListItem>[] {
  return [
    {
      id: 'customer',
      header: 'Customer',
      cell: (row) => (
        <Flex align="center" gap="12px" minW={0}>
          <Avatar
            size="sm"
            name={row.full_name ?? undefined}
            src={row.picture_url ?? undefined}
          />
          <Flex direction="column" minW={0}>
            <Text fontWeight={700} noOfLines={1}>
              {row.full_name ?? '—'}
            </Text>
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {row.email ?? 'No email'}
            </Text>
          </Flex>
        </Flex>
      ),
    },
    {
      id: 'location',
      header: 'Location',
      cell: (row) => row.location ?? '—',
    },
    {
      id: 'stays',
      header: 'Stays',
      meta: { fontWeight: 700 },
      cell: (row) => row.stays_count,
    },
    {
      id: 'spent',
      header: 'Total spent',
      meta: { fontWeight: 700 },
      cell: (row) =>
        row.total_spent > 0 ? formatMoney(row.total_spent, row.currency) : '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        row.stays_count > 0 ? (
          <StatusBadge tone="brand">Guest</StatusBadge>
        ) : (
          <StatusBadge tone="mute">New</StatusBadge>
        ),
    },
  ];
}

export function renderCustomerMobileCard(customer: CustomerListItem): ReactNode {
  return (
    <>
      <Flex justify="space-between" gap="8px" mb="10px" align="flex-start">
        <Flex align="center" gap="12px" minW={0}>
          <Avatar
            size="sm"
            name={customer.full_name ?? undefined}
            src={customer.picture_url ?? undefined}
          />
          <Flex direction="column" minW={0}>
            <Text fontWeight={700} noOfLines={1}>
              {customer.full_name ?? '—'}
            </Text>
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {customer.email ?? 'No email'}
            </Text>
          </Flex>
        </Flex>
        {customer.stays_count > 0 ? (
          <StatusBadge tone="brand">Guest</StatusBadge>
        ) : (
          <StatusBadge tone="mute">New</StatusBadge>
        )}
      </Flex>
      <Text fontSize="13px" color="ink.400">
        {customer.location ?? '—'} · {customer.stays_count} stays ·{' '}
        {customer.total_spent > 0
          ? formatMoney(customer.total_spent, customer.currency)
          : 'No spend'}
      </Text>
    </>
  );
}
