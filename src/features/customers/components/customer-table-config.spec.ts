import { getCustomerColumns } from './customer-table-config';

describe('getCustomerColumns', () => {
  it('returns the expected customer list columns', () => {
    expect(getCustomerColumns().map((column) => column.id)).toEqual([
      'customer',
      'location',
      'stays',
      'spent',
      'status',
      'created',
      'updated',
    ]);
  });
});
