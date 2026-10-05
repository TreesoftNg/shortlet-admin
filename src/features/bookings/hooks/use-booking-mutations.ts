'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  cancelBooking,
  checkInBooking,
  releaseDeposit,
} from '../api/bookings-service';
import type { ReleaseDepositInput } from '../types';

async function invalidateBookingQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  bookingId?: string,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
    bookingId
      ? queryClient.invalidateQueries({
          queryKey: queryKeys.bookings.detail(bookingId),
        })
      : Promise.resolve(),
  ]);
}

export function useCheckInBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => checkInBooking(id),
    onSuccess: async (booking) => {
      await invalidateBookingQueries(queryClient, booking.id);
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      cancelBooking(id, reason),
    onSuccess: async (booking) => {
      await invalidateBookingQueries(queryClient, booking.id);
    },
  });
}

export function useReleaseDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: ReleaseDepositInput;
    }) => releaseDeposit(id, input),
    onSuccess: async (booking) => {
      await invalidateBookingQueries(queryClient, booking.id);
    },
  });
}
