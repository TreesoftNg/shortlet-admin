import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { RefundView } from '@/features/bookings/types';
import type {
  CreateStayRefundInput,
  ListPaymentsParams,
  PaginatedPayments,
  PaymentDetail,
  PaymentView,
} from '../types';

function buildQuery(params: ListPaymentsParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.status) search.set('status', params.status);
  if (params.bookingId) search.set('bookingId', params.bookingId);
  if (params.search?.trim()) search.set('search', params.search.trim());
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** GET /cc/payments */
export async function fetchPayments(
  params: ListPaymentsParams = {},
): Promise<PaginatedPayments> {
  const response = await apiClient<PaymentView[]>(
    adminPath(`/payments${buildQuery(params)}`),
  );
  return {
    items: response.data,
    page: response.meta?.page ?? params.page ?? 1,
    limit: response.meta?.limit ?? params.limit ?? 20,
    total: response.meta?.total ?? response.data.length,
    totalPages: response.meta?.totalPages ?? 1,
  };
}

/** GET /cc/payments/:id */
export async function fetchPayment(id: string): Promise<PaymentDetail> {
  return (await apiClient<PaymentDetail>(adminPath(`/payments/${id}`))).data;
}

/** POST /cc/payments/:id/verify */
export async function verifyPayment(id: string): Promise<PaymentDetail> {
  return (
    await apiClient<PaymentDetail>(adminPath(`/payments/${id}/verify`), {
      method: 'POST',
    })
  ).data;
}

/** POST /cc/payments/:id/refunds — stay refunds only. */
export async function createStayRefund(
  id: string,
  input: CreateStayRefundInput,
): Promise<RefundView> {
  return (
    await apiClient<RefundView>(adminPath(`/payments/${id}/refunds`), {
      method: 'POST',
      body: {
        amount: input.amount,
        reason: input.reason,
        note: input.note,
      },
    })
  ).data;
}
