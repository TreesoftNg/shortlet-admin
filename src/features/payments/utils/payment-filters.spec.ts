import {
  countPaymentTabs,
  DEFAULT_PAYMENT_FILTERS,
  filterPayments,
  getPaymentStatusDisplay,
} from './payment-filters';
import { buildPaymentList } from '@/mocks/data/payments';

const payments = buildPaymentList();

describe('payment-filters', () => {
  it('counts status tabs', () => {
    const counts = countPaymentTabs(payments);
    expect(counts.all).toBe(payments.length);
    expect(counts.successful).toBeGreaterThan(0);
    expect(counts.pending).toBeGreaterThan(0);
    expect(counts.failed).toBeGreaterThan(0);
    expect(counts.refunds).toBeGreaterThan(0);
  });

  it('filters refunds tab', () => {
    const result = filterPayments(payments, {
      ...DEFAULT_PAYMENT_FILTERS,
      tab: 'refunds',
    });
    expect(
      result.every((item) =>
        ['REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'].includes(
          item.status,
        ),
      ),
    ).toBe(true);
  });

  it('filters by search', () => {
    const bySearch = filterPayments(payments, {
      ...DEFAULT_PAYMENT_FILTERS,
      search: 'temitope',
    });
    expect(bySearch.length).toBeGreaterThan(0);
  });

  it('uses flutterwave as the only provider', () => {
    expect(payments.every((item) => item.provider === 'flutterwave')).toBe(
      true,
    );
  });

  it('maps payment status display', () => {
    expect(getPaymentStatusDisplay('SUCCESS')).toEqual({
      label: 'Successful',
      tone: 'ok',
    });
    expect(getPaymentStatusDisplay('REFUND_PENDING')).toEqual({
      label: 'Refund pending',
      tone: 'warn',
    });
  });
});
