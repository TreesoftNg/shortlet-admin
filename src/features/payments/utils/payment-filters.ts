import { mapPaymentStatusTone } from '@/features/bookings/utils/reservation-display';
import type { PaymentListItem } from '@/mocks/data/payments';
import type { StatusTone } from '@/shared/components/ui';
import type { PaymentStatus } from '@/shared/types/hospitable';

export type PaymentStatusTab =
  | 'all'
  | 'successful'
  | 'pending'
  | 'failed'
  | 'refunds';

export type PaymentFilters = {
  tab: PaymentStatusTab;
  search: string;
};

export type PaymentTabCount = Record<PaymentStatusTab, number>;

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  tab: 'all',
  search: '',
};

const PENDING_STATUSES: PaymentStatus[] = ['INITIALIZED', 'PENDING'];
const FAILED_STATUSES: PaymentStatus[] = ['FAILED', 'CANCELLED'];
const REFUND_STATUSES: PaymentStatus[] = [
  'REFUND_PENDING',
  'REFUNDED',
  'PARTIALLY_REFUNDED',
];

function matchesTab(payment: PaymentListItem, tab: PaymentStatusTab): boolean {
  if (tab === 'successful') return payment.status === 'SUCCESS';
  if (tab === 'pending') return PENDING_STATUSES.includes(payment.status);
  if (tab === 'failed') return FAILED_STATUSES.includes(payment.status);
  if (tab === 'refunds') return REFUND_STATUSES.includes(payment.status);
  return true;
}

function matchesSearch(payment: PaymentListItem, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    payment.reference,
    payment.provider,
    payment.status,
    payment.reservation?.platform_id,
    payment.reservation?.guest?.full_name,
    payment.reservation?.property?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function countPaymentTabs(payments: PaymentListItem[]): PaymentTabCount {
  return {
    all: payments.length,
    successful: payments.filter((item) => item.status === 'SUCCESS').length,
    pending: payments.filter((item) => PENDING_STATUSES.includes(item.status))
      .length,
    failed: payments.filter((item) => FAILED_STATUSES.includes(item.status))
      .length,
    refunds: payments.filter((item) => REFUND_STATUSES.includes(item.status))
      .length,
  };
}

export function filterPayments(
  payments: PaymentListItem[],
  filters: PaymentFilters,
): PaymentListItem[] {
  return payments
    .filter(
      (payment) =>
        matchesTab(payment, filters.tab) &&
        matchesSearch(payment, filters.search),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getPaymentStatusDisplay(status: PaymentStatus): {
  label: string;
  tone: StatusTone;
} {
  const labels: Record<PaymentStatus, string> = {
    INITIALIZED: 'Initialized',
    PENDING: 'Pending',
    SUCCESS: 'Successful',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    REFUND_PENDING: 'Refund pending',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partial refund',
  };

  return {
    label: labels[status] ?? status,
    tone: mapPaymentStatusTone(status),
  };
}

export function formatPaymentDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

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
