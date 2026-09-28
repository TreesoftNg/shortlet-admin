import { getPaymentColumns } from './payment-table-config';

describe('getPaymentColumns', () => {
  it('returns the expected payment list columns', () => {
    expect(getPaymentColumns().map((column) => column.id)).toEqual([
      'reference',
      'guest',
      'property',
      'amount',
      'provider',
      'date',
      'status',
    ]);
  });
});
