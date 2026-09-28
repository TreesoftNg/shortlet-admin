'use client';

import { Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import type { PaymentListItem } from '@/mocks/data/payments';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui';
import {
  formatPaymentDate,
  formatProviderLabel,
  getPaymentStatusDisplay,
} from '../utils/payment-filters';

export function getPaymentColumns(): DataTableColumn<PaymentListItem>[] {
  return [
    {
      id: 'reference',
      header: 'Reference',
      cell: (row) => (
        <Flex direction="column">
          <Text fontWeight={700}>{row.reference}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.reservation?.platform_id ?? row.reservation_id}
          </Text>
        </Flex>
      ),
    },
    {
      id: 'guest',
      header: 'Guest',
      cell: (row) => row.reservation?.guest?.full_name ?? '—',
    },
    {
      id: 'property',
      header: 'Property',
      cell: (row) => row.reservation?.property?.name ?? '—',
    },
    {
      id: 'amount',
      header: 'Amount',
      cell: (row) => (
        <Text fontWeight={700}>{formatMoney(row.amount, row.currency)}</Text>
      ),
    },
    {
      id: 'provider',
      header: 'Provider',
      cell: (row) => formatProviderLabel(row.provider),
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row) => formatPaymentDate(row.created_at),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getPaymentStatusDisplay(row.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
  ];
}

export function renderPaymentMobileCard(payment: PaymentListItem): ReactNode {
  const status = getPaymentStatusDisplay(payment.status);

  return (
    <>
      <Flex justify="space-between" gap="8px" mb="8px" align="flex-start">
        <Flex direction="column" minW={0}>
          <Text fontWeight={700} noOfLines={1}>
            {payment.reference}
          </Text>
          <Text color="ink.300" fontSize="12px" noOfLines={1}>
            {payment.reservation?.guest?.full_name ?? '—'} ·{' '}
            {payment.reservation?.property?.name ?? '—'}
          </Text>
        </Flex>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>
      <Flex justify="space-between" align="center" gap="8px">
        <Text fontWeight={700}>
          {formatMoney(payment.amount, payment.currency)}
        </Text>
        <Text fontSize="12px" color="ink.300">
          {formatProviderLabel(payment.provider)} ·{' '}
          {formatPaymentDate(payment.created_at)}
        </Text>
      </Flex>
    </>
  );
}
