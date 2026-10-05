'use client';

import { Box, Text } from '@chakra-ui/react';
import { formatMoney } from '@/features/bookings/utils/booking-display';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import type { PaymentView } from '../types';
import {
  formatPaymentDateTime,
  formatProviderLabel,
  getPaymentStatusDisplay,
} from '../utils/payment-filters';

export function getPaymentColumns(): DataTableColumn<PaymentView>[] {
  return [
    {
      id: 'reference',
      header: 'Reference',
      meta: { fontFamily: 'mono', fontWeight: 600 },
      cell: (row) => row.reference,
    },
    {
      id: 'booking',
      header: 'Booking',
      cell: (row) => (
        <Box>
          <Text fontWeight={700}>{row.bookingReference ?? '—'}</Text>
          <Text color="ink.300" fontSize="12px" fontFamily="mono">
            {row.bookingId.slice(0, 8)}…
          </Text>
        </Box>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      meta: { fontWeight: 700 },
      cell: (row) => formatMoney(row.amount, row.currency),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getPaymentStatusDisplay(row.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    {
      id: 'provider',
      header: 'Provider',
      cell: (row) => formatProviderLabel(row.provider),
    },
    {
      id: 'created',
      header: 'Created',
      cell: (row) => formatPaymentDateTime(row.createdAt),
    },
  ];
}
