'use client';

import { Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { formatMoney } from '@/features/bookings/utils/reservation-display';
import type { RefundListItem } from '@/mocks/data/refunds';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui';
import {
  formatRefundDate,
  getRefundReasonLabel,
  getRefundStatusDisplay,
} from '../utils/refund-filters';

export function getRefundColumns(): DataTableColumn<RefundListItem>[] {
  return [
    {
      id: 'guest',
      header: 'Guest',
      cell: (row) => (
        <Flex direction="column">
          <Text fontWeight={700}>
            {row.reservation?.guest?.full_name ?? '—'}
          </Text>
          <Text color="ink.300" fontSize="12px">
            {row.reservation?.platform_id ?? row.reservation_id}
          </Text>
        </Flex>
      ),
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
      id: 'reason',
      header: 'Reason',
      cell: (row) => getRefundReasonLabel(row.reason),
    },
    {
      id: 'payment',
      header: 'Payment',
      cell: (row) => (
        <Text fontSize="13px">{row.payment?.reference ?? row.payment_id}</Text>
      ),
    },
    {
      id: 'date',
      header: 'Requested',
      cell: (row) => formatRefundDate(row.created_at),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getRefundStatusDisplay(row.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
  ];
}

export function renderRefundMobileCard(refund: RefundListItem): ReactNode {
  const status = getRefundStatusDisplay(refund.status);

  return (
    <>
      <Flex justify="space-between" gap="8px" mb="8px" align="flex-start">
        <Flex direction="column" minW={0}>
          <Text fontWeight={700} noOfLines={1}>
            {refund.reservation?.guest?.full_name ?? '—'}
          </Text>
          <Text color="ink.300" fontSize="12px" noOfLines={1}>
            {refund.reservation?.property?.name ?? '—'} ·{' '}
            {getRefundReasonLabel(refund.reason)}
          </Text>
        </Flex>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>
      <Flex justify="space-between" align="center" gap="8px">
        <Text fontWeight={700}>
          {formatMoney(refund.amount, refund.currency)}
        </Text>
        <Text fontSize="12px" color="ink.300">
          {formatRefundDate(refund.created_at)}
        </Text>
      </Flex>
    </>
  );
}
