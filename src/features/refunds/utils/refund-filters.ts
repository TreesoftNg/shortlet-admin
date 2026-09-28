import type { RefundListItem } from '@/mocks/data/refunds';
import type { StatusTone } from '@/shared/components/ui';
import type { RefundReason, RefundStatus } from '@/shared/types/hospitable';

export type RefundStatusTab =
  | 'all'
  | 'needs_action'
  | 'processing'
  | 'completed'
  | 'rejected';

export type RefundFilters = {
  tab: RefundStatusTab;
  search: string;
  reason: RefundReason | 'all';
};

export type RefundTabCount = Record<RefundStatusTab, number>;

export const DEFAULT_REFUND_FILTERS: RefundFilters = {
  tab: 'all',
  search: '',
  reason: 'all',
};

const NEEDS_ACTION: RefundStatus[] = ['requested', 'pending_approval'];

function matchesTab(refund: RefundListItem, tab: RefundStatusTab): boolean {
  if (tab === 'needs_action') return NEEDS_ACTION.includes(refund.status);
  if (tab === 'processing') return refund.status === 'processing';
  if (tab === 'completed') return refund.status === 'completed';
  if (tab === 'rejected') return refund.status === 'rejected';
  return true;
}

function matchesSearch(refund: RefundListItem, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    refund.id,
    refund.notes,
    refund.requested_by,
    refund.reason,
    refund.payment?.reference,
    refund.reservation?.platform_id,
    refund.reservation?.guest?.full_name,
    refund.reservation?.property?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesReason(
  refund: RefundListItem,
  reason: RefundReason | 'all',
): boolean {
  if (reason === 'all') return true;
  return refund.reason === reason;
}

export function countRefundTabs(refunds: RefundListItem[]): RefundTabCount {
  return {
    all: refunds.length,
    needs_action: refunds.filter((item) => NEEDS_ACTION.includes(item.status))
      .length,
    processing: refunds.filter((item) => item.status === 'processing').length,
    completed: refunds.filter((item) => item.status === 'completed').length,
    rejected: refunds.filter((item) => item.status === 'rejected').length,
  };
}

export function filterRefunds(
  refunds: RefundListItem[],
  filters: RefundFilters,
): RefundListItem[] {
  return refunds
    .filter(
      (refund) =>
        matchesTab(refund, filters.tab) &&
        matchesSearch(refund, filters.search) &&
        matchesReason(refund, filters.reason),
    )
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getRefundStatusDisplay(status: RefundStatus): {
  label: string;
  tone: StatusTone;
} {
  switch (status) {
    case 'requested':
      return { label: 'Requested', tone: 'warn' };
    case 'pending_approval':
      return { label: 'Needs approval', tone: 'warn' };
    case 'processing':
      return { label: 'Processing', tone: 'info' };
    case 'completed':
      return { label: 'Completed', tone: 'ok' };
    case 'rejected':
      return { label: 'Rejected', tone: 'danger' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function getRefundReasonLabel(reason: RefundReason): string {
  const labels: Record<RefundReason, string> = {
    guest_cancellation: 'Guest cancellation',
    host_cancellation: 'Host cancellation',
    partial_stay: 'Partial stay',
    service_issue: 'Service issue',
    duplicate_charge: 'Duplicate charge',
    other: 'Other',
  };
  return labels[reason] ?? reason;
}

export function formatRefundDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatRefundDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const REFUND_REASON_OPTIONS: Array<{
  value: RefundReason;
  label: string;
}> = [
  { value: 'guest_cancellation', label: 'Guest cancellation' },
  { value: 'host_cancellation', label: 'Host cancellation' },
  { value: 'partial_stay', label: 'Partial stay' },
  { value: 'service_issue', label: 'Service issue' },
  { value: 'duplicate_charge', label: 'Duplicate charge' },
  { value: 'other', label: 'Other' },
];
