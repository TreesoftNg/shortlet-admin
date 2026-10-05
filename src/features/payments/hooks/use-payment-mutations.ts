'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { createStayRefund, verifyPayment } from '../api/payments-service';
import type { CreateStayRefundInput } from '../types';

async function invalidatePaymentQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  paymentId?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
    paymentId
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.payments.detail(paymentId),
        })
      : Promise.resolve(),
  ]);
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => verifyPayment(id),
    onSuccess: async (payment) => {
      await invalidatePaymentQueries(queryClient, payment.id);
    },
  });
}

export function useCreateStayRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CreateStayRefundInput;
    }) => createStayRefund(id, input),
    onSuccess: async (_refund, variables) => {
      await invalidatePaymentQueries(queryClient, variables.id);
    },
  });
}
