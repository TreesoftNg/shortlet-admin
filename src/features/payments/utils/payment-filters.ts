import type { PaymentStatus } from '@/features/bookings/types';
import {
  getPaymentStatusDisplay,
} from '@/features/bookings/utils/booking-display';
import type { ListPaymentsParams } from '../types';

export type PaymentStatusTab =
  | 'all'
  | 'successful'
  | 'pending'
  | 'failed'
  | 'refunds';

export type PaymentFilters = {
  tab: PaymentStatusTab;
  search: string;
  page: number;
  pageSize: number;
};

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  tab: 'all',
  search: '',
  page: 1,
  pageSize: 20,
};

const TAB_STATUS: Partial<Record<PaymentStatusTab, PaymentStatus>> = {
  successful: 'successful',
  pending: 'initialized',
  failed: 'failed',
  refunds: 'refunded',
};

/** Map UI filters to GET /cc/payments query params. */
export function toListPaymentsParams(
  filters: PaymentFilters,
): ListPaymentsParams {
  const params: ListPaymentsParams = {
    page: filters.page,
    limit: filters.pageSize,
  };
  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  const status = TAB_STATUS[filters.tab];
  if (status) {
    params.status = status;
  }
  return params;
}

export { getPaymentStatusDisplay };

export function formatPaymentDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatProviderLabel(provider: string): string {
  if (provider === 'flutterwave') return 'Flutterwave';
  return provider;
}
