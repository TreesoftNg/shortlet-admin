import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type {
  AdminBooking,
  BookingListItem,
  ListBookingsParams,
  PaginatedBookings,
  ReleaseDepositInput,
} from '../types';

function buildQuery(params: ListBookingsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);
  if (params.unitId) search.set('unitId', params.unitId);
  if (params.propertyId) search.set('propertyId', params.propertyId);
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.deposit) search.set('deposit', params.deposit);
  if (params.search?.trim()) search.set('search', params.search.trim());
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** GET /cc/bookings — paginated list with server-side filters. */
export async function fetchBookings(
  params: ListBookingsParams = {},
): Promise<PaginatedBookings> {
  const response = await apiClient<BookingListItem[]>(
    adminPath(`/bookings${buildQuery(params)}`),
  );
  return {
    items: response.data,
    page: response.meta?.page ?? params.page ?? 1,
    limit: response.meta?.limit ?? params.limit ?? 20,
    total: response.meta?.total ?? response.data.length,
    totalPages: response.meta?.totalPages ?? 1,
  };
}

/** GET /cc/bookings/:id */
export async function fetchBooking(id: string): Promise<AdminBooking> {
  return (await apiClient<AdminBooking>(adminPath(`/bookings/${id}`))).data;
}

/** POST /cc/bookings/:id/check-in */
export async function checkInBooking(id: string): Promise<AdminBooking> {
  return (
    await apiClient<AdminBooking>(adminPath(`/bookings/${id}/check-in`), {
      method: 'POST',
    })
  ).data;
}

/** POST /cc/bookings/:id/cancel */
export async function cancelBooking(
  id: string,
  reason: string,
): Promise<AdminBooking> {
  return (
    await apiClient<AdminBooking>(adminPath(`/bookings/${id}/cancel`), {
      method: 'POST',
      body: { reason },
    })
  ).data;
}

/** POST /cc/bookings/:id/deposit/release */
export async function releaseDeposit(
  id: string,
  input: ReleaseDepositInput,
): Promise<AdminBooking> {
  return (
    await apiClient<AdminBooking>(adminPath(`/bookings/${id}/deposit/release`), {
      method: 'POST',
      body: {
        refundAmount: input.refundAmount,
        deductionReason: input.deductionReason ?? undefined,
      },
    })
  ).data;
}
