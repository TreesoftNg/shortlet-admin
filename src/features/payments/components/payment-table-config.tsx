'use client';

import { Box, Text } from '@chakra-ui/react';
import { formatMoney } from '@/features/bookings/utils/booking-display';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import { timestampColumns } from '@/shared/components/ui/timestamp-columns';
import type { PaymentView } from '../types';
import {
  formatProviderLabel,
  getPaymentStatusDisplay,
} from '../utils/payment-filters';

export function getPaymentColumns(): DataTableColumn<PaymentView>[] {
  return [
    {
      id: 'guest',
      header: 'Guest',
      cell: (row) => (
        <Box>
          <Text fontWeight={700}>{row.guestName ?? '—'}</Text>
          {row.unitName ? (
            <Text color="ink.300" fontSize="12px">
              {row.unitName}
            </Text>
          ) : null}
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
    ...timestampColumns<PaymentView>(
      (row) => row.createdAt,
      (row) => row.updatedAt,
    ),
  ];
}
