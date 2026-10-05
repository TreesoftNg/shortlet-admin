import {
  DEFAULT_BOOKING_FILTERS,
  toListBookingsParams,
} from './booking-filters';

describe('toListBookingsParams', () => {
  it('maps upcoming tab to confirmed + from today', () => {
    expect(
      toListBookingsParams(
        { ...DEFAULT_BOOKING_FILTERS, tab: 'upcoming' },
        '2026-10-05',
      ),
    ).toEqual({
      page: 1,
      limit: 20,
      status: 'confirmed',
      from: '2026-10-05',
    });
  });

  it('maps deposit tabs', () => {
    expect(
      toListBookingsParams({
        ...DEFAULT_BOOKING_FILTERS,
        tab: 'deposits_due',
      }),
    ).toMatchObject({ deposit: 'due' });
    expect(
      toListBookingsParams({
        ...DEFAULT_BOOKING_FILTERS,
        tab: 'deposits_overdue',
      }),
    ).toMatchObject({ deposit: 'overdue' });
  });

  it('includes search and property filters', () => {
    expect(
      toListBookingsParams({
        ...DEFAULT_BOOKING_FILTERS,
        search: '  SM-ABC  ',
        propertyId: '33333333-3333-3333-3333-333333333333',
        tab: 'cancelled',
      }),
    ).toEqual({
      page: 1,
      limit: 20,
      search: 'SM-ABC',
      propertyId: '33333333-3333-3333-3333-333333333333',
      status: 'cancelled',
    });
  });
});
