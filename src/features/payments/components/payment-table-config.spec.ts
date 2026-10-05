import { getPaymentColumns } from './payment-table-config';

describe('getPaymentColumns', () => {
  it('returns payment list columns', () => {
    expect(getPaymentColumns().map((column) => column.id)).toEqual([
      'reference',
      'booking',
      'amount',
      'status',
      'provider',
      'created',
    ]);
  });
});
