import {
  countRefundTabs,
  DEFAULT_REFUND_FILTERS,
  filterRefunds,
  getRefundReasonLabel,
  getRefundStatusDisplay,
} from './refund-filters';
import { buildRefundList } from '@/mocks/data/refunds';

const refunds = buildRefundList();

describe('refund-filters', () => {
  it('counts status tabs', () => {
    const counts = countRefundTabs(refunds);
    expect(counts.all).toBe(refunds.length);
    expect(counts.needs_action).toBeGreaterThan(0);
    expect(counts.processing).toBeGreaterThan(0);
    expect(counts.completed).toBeGreaterThan(0);
    expect(counts.rejected).toBeGreaterThan(0);
  });

  it('filters needs_action tab', () => {
    const result = filterRefunds(refunds, {
      ...DEFAULT_REFUND_FILTERS,
      tab: 'needs_action',
    });
    expect(
      result.every((item) =>
        ['requested', 'pending_approval'].includes(item.status),
      ),
    ).toBe(true);
  });

  it('filters by search and reason', () => {
    const bySearch = filterRefunds(refunds, {
      ...DEFAULT_REFUND_FILTERS,
      search: 'ibrahim',
    });
    expect(bySearch.length).toBeGreaterThan(0);

    const byReason = filterRefunds(refunds, {
      ...DEFAULT_REFUND_FILTERS,
      reason: 'guest_cancellation',
    });
    expect(
      byReason.every((item) => item.reason === 'guest_cancellation'),
    ).toBe(true);
  });

  it('maps status and reason labels', () => {
    expect(getRefundStatusDisplay('pending_approval')).toEqual({
      label: 'Needs approval',
      tone: 'warn',
    });
    expect(getRefundReasonLabel('partial_stay')).toBe('Partial stay');
  });
});
