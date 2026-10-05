'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchPayment, fetchPayments } from '../api/payments-service';
import type { ListPaymentsParams } from '../types';

type UsePaymentsOptions = {
  params: ListPaymentsParams;
  enabled?: boolean;
};

export function usePayments({ params, enabled = true }: UsePaymentsOptions) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () => fetchPayments(params),
    enabled,
  });
}

export function usePayment(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id ?? ''),
    queryFn: () => fetchPayment(id!),
    enabled: Boolean(id) && enabled,
  });
}
