import { getBookingColumns } from './booking-table-config';

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

  it('returns bookings-page columns without payment', () => {
    const columns = getBookingColumns('bookings');
    expect(columns.map((column) => column.id)).toEqual([
      'reference',
      'guest',
      'property',
      'dates',
      'amount',
      'status',
    ]);
  });
});
