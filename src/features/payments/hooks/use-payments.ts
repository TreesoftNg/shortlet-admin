'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchPayments } from '../api/payments-service';

export function usePayments() {
  return useQuery({
    queryKey: queryKeys.payments.list(),
    queryFn: fetchPayments,
    select: (response) => response.data,
  });
}
