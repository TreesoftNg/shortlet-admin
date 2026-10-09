'use client';

import { Avatar, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { timestampColumns } from '@/shared/components/ui/timestamp-columns';
import { StatusBadge } from '@/shared/components/ui';
import type { Customer } from '../types';
import { isReturningGuest } from '../utils/customer-filters';

export function getCustomerColumns(): DataTableColumn<Customer>[] {
  return [
    {
      id: 'customer',
      header: 'Customer',
      cell: (row) => (
        <Flex align="center" gap="12px" minW={0}>
          <Avatar size="sm" name={row.fullName} src={row.pictureUrl ?? undefined} />
          <Flex direction="column" minW={0}>
            <Text fontWeight={700} noOfLines={1}>
              {row.fullName || '—'}
            </Text>
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {row.email || 'No email'}
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
      cell: (row) => row.staysCount,
    },
    {
      id: 'spent',
      header: 'Total spent',
      meta: { fontWeight: 700 },
      cell: (row) =>
        row.totalSpent > 0 ? formatMoney(row.totalSpent, row.currency) : '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        isReturningGuest(row) ? (
          <StatusBadge tone="brand">Guest</StatusBadge>
        ) : (
          <StatusBadge tone="mute">New</StatusBadge>
        ),
    },
    ...timestampColumns<Customer>(
      (row) => row.createdAt,
      (row) => row.updatedAt,
    ),
  ];
}

export function renderCustomerMobileCard(customer: Customer): ReactNode {
  return (
    <>
      <Flex justify="space-between" gap="8px" mb="10px" align="flex-start">
        <Flex align="center" gap="12px" minW={0}>
          <Avatar
            size="sm"
            name={customer.fullName}
            src={customer.pictureUrl ?? undefined}
          />
          <Flex direction="column" minW={0}>
            <Text fontWeight={700} noOfLines={1}>
              {customer.fullName || '—'}
            </Text>
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {customer.email || 'No email'}
            </Text>
          </Flex>
        </Flex>
        {isReturningGuest(customer) ? (
          <StatusBadge tone="brand">Guest</StatusBadge>
        ) : (
          <StatusBadge tone="mute">New</StatusBadge>
        )}
      </Flex>
      <Text fontSize="13px" color="ink.400">
        {customer.location ?? '—'} · {customer.staysCount} stays ·{' '}
        {customer.totalSpent > 0
          ? formatMoney(customer.totalSpent, customer.currency)
          : 'No spend'}
      </Text>
    </>
  );
}
