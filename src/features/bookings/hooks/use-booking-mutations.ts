'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  cancelReservation,
  checkInReservation,
  refundReservation,
} from '../api/bookings-service';

async function invalidateBookingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.availability.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.refunds.all }),
  ]);
}

export function useCheckInReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checkInReservation(id),
    onSuccess: async () => {
      await invalidateBookingQueries(queryClient);
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: async () => {
      await invalidateBookingQueries(queryClient);
    },
  });
}

export function useRefundReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => refundReservation(id),
    onSuccess: async () => {
      await invalidateBookingQueries(queryClient);
    },
  });
}
