'use client';

import { Alert, AlertIcon, Text } from '@chakra-ui/react';
import type { OtherCurrencyRevenue } from '../types';
import { formatAmount } from '../utils/report-format';

/** Revenue in currencies other than the business currency, which the totals leave out. */
export function OtherCurrenciesNote({ entries, currency }: { entries: OtherCurrencyRevenue[]; currency: string }) {
  if (!entries.length) return null;
  const list = entries
    .map((entry) => `${formatAmount(entry.revenue, entry.currency)} from ${entry.bookings} booking${entry.bookings === 1 ? '' : 's'}`)
    .join(', ');
  return (
    <Alert status="info" borderRadius="12px" fontSize="13px" py="8px">
      <AlertIcon />
      <Text>
        Totals are in {currency}. Not included: {list}.
      </Text>
    </Alert>
  );
}
