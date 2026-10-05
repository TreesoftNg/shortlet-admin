import {
  DEFAULT_PAYMENT_FILTERS,
  toListPaymentsParams,
} from './payment-filters';

describe('toListPaymentsParams', () => {
  it('maps status tabs', () => {
    expect(
      toListPaymentsParams({ ...DEFAULT_PAYMENT_FILTERS, tab: 'successful' }),
    ).toMatchObject({ status: 'successful' });
    expect(
      toListPaymentsParams({ ...DEFAULT_PAYMENT_FILTERS, tab: 'pending' }),
    ).toMatchObject({ status: 'initialized' });
    expect(
      toListPaymentsParams({ ...DEFAULT_PAYMENT_FILTERS, tab: 'refunds' }),
    ).toMatchObject({ status: 'refunded' });
  });

  it('includes search', () => {
    expect(
      toListPaymentsParams({
        ...DEFAULT_PAYMENT_FILTERS,
        search: '  pay_SM  ',
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      search: 'pay_SM',
    });
  });
});
