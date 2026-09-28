import { getRefundColumns } from './refund-table-config';

describe('getRefundColumns', () => {
  it('returns the expected refund list columns', () => {
    expect(getRefundColumns().map((column) => column.id)).toEqual([
      'guest',
      'property',
      'amount',
      'reason',
      'payment',
      'date',
      'status',
    ]);
  });
});
