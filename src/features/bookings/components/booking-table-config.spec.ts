import { getBookingListColumns } from './booking-table-config';

describe('getBookingListColumns', () => {
  it('returns live booking list columns', () => {
    expect(getBookingListColumns().map((column) => column.id)).toEqual([
      'reference',
      'guest',
      'property',
      'dates',
      'amount',
      'status',
      'deposit',
    ]);
  });
});

