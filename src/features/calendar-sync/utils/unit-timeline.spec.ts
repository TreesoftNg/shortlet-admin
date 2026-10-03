import {
  buildTimelineBars,
  buildTimelineWindow,
  clipBarToWindow,
  shiftAnchorDate,
} from './unit-timeline';
import type { AvailabilityBlock, ImportedBooking } from '../types';

describe('unit-timeline', () => {
  it('builds a fixed-length day window', () => {
    const window = buildTimelineWindow('2026-10-01', 7);
    expect(window.startDate).toBe('2026-10-01');
    expect(window.endDate).toBe('2026-10-07');
    expect(window.dates).toHaveLength(7);
    expect(shiftAnchorDate('2026-10-01', 7)).toBe('2026-10-08');
  });

  it('clips bars that partially overlap the window', () => {
    expect(
      clipBarToWindow('2026-09-28', '2026-10-03', '2026-10-01', '2026-10-28'),
    ).toEqual({ startDate: '2026-10-01', endDate: '2026-10-03' });
    expect(
      clipBarToWindow('2026-09-01', '2026-09-05', '2026-10-01', '2026-10-28'),
    ).toBeNull();
  });

  it('builds bars from bookings and blocks', () => {
    const bookings: ImportedBooking[] = [
      {
        id: 'e1',
        source: 'hospitable',
        externalUid: 'x',
        reservationCode: 'ABC',
        guestName: 'Ada Okafor',
        guestEmail: null,
        guestPhone: null,
        adults: 2,
        children: 0,
        checkIn: '',
        checkOut: '',
        startDate: '2026-10-02',
        endDate: '2026-10-05',
        status: 'active',
        firstSeenAt: '',
        lastSeenAt: '',
        removedAt: null,
      },
      {
        id: 'e2',
        source: 'hospitable',
        externalUid: 'y',
        reservationCode: null,
        guestName: 'Chidi',
        guestEmail: null,
        guestPhone: null,
        adults: 1,
        children: 0,
        checkIn: '',
        checkOut: '',
        startDate: '2026-10-10',
        endDate: '2026-10-12',
        status: 'removed',
        firstSeenAt: '',
        lastSeenAt: '',
        removedAt: '',
      },
    ];
    const blocks: AvailabilityBlock[] = [
      {
        id: 'b1',
        unitId: 'u1',
        startDate: '2026-10-20',
        endDate: '2026-10-22',
        nights: 2,
        reason: 'maintenance',
        note: 'AC service',
        createdAt: '',
      },
    ];

    const window = buildTimelineWindow('2026-10-01', 28);
    const bars = buildTimelineBars(bookings, blocks, window);

    expect(bars.map((bar) => bar.kind)).toEqual(['external', 'cancelled', 'blocked']);
    expect(bars[0].label).toContain('Ada Okafor');
    expect(bars[0].initials).toBe('AO');
    expect(bars[1].label).toContain('cancelled');
    expect(bars[2].label).toBe('AC service');
  });
});
