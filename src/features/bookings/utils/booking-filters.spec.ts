import {
  countBookingTabs,
  filterReservations,
  paginateReservations,
  DEFAULT_BOOKING_FILTERS,
} from './booking-filters';
import { mockReservations } from '@/mocks/data';

describe('booking-filters', () => {
  it('counts tabs from reservation statuses', () => {
    const counts = countBookingTabs(mockReservations, '2026-09-28');
    expect(counts.all).toBe(mockReservations.length);
    expect(counts.awaiting_payment).toBeGreaterThan(0);
    expect(counts.cancelled).toBeGreaterThan(0);
    expect(counts.upcoming).toBeGreaterThan(0);
  });

  it('filters by search query across reference and guest', () => {
    const result = filterReservations(
      mockReservations,
      { ...DEFAULT_BOOKING_FILTERS, search: 'HVN-7Q4K' },
      '2026-09-28',
    );
    expect(result).toHaveLength(1);
    expect(result[0].platform_id).toBe('HVN-7Q4K-2291');
  });

  it('filters cancelled tab', () => {
    const result = filterReservations(
      mockReservations,
      { ...DEFAULT_BOOKING_FILTERS, tab: 'cancelled' },
      '2026-09-28',
    );
    expect(
      result.every(
        (item) => item.reservation_status.current.category === 'cancelled',
      ),
    ).toBe(true);
  });

  it('paginates results', () => {
    const page = paginateReservations(mockReservations, 1, 3);
    expect(page.items).toHaveLength(3);
    expect(page.total).toBe(mockReservations.length);
    expect(page.totalPages).toBe(Math.ceil(mockReservations.length / 3));
  });
});
