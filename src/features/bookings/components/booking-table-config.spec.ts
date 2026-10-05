import { getBookingColumns, getBookingListColumns } from './booking-table-config';

describe('getBookingColumns', () => {
  it('returns dashboard columns including payment', () => {
    const columns = getBookingColumns('dashboard');
    expect(columns.map((column) => column.id)).toEqual([
      'reference',
      'guest',
      'property',
      'dates',
      'amount',
      'payment',
      'status',
    ]);
  });

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

