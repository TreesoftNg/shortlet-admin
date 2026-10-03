import { addDays, eachDateInRange } from '@/features/availability/utils/calendar';
import type { AvailabilityBlock, ImportedBooking } from '../types';
import { todayIsoDate } from './calendar-sync-format';

export type TimelineBarKind = 'external' | 'blocked' | 'cancelled';

export type TimelineBar = {
  id: string;
  kind: TimelineBarKind;
  label: string;
  startDate: string;
  endDate: string;
  initials: string | null;
};

export type TimelineWindow = {
  startDate: string;
  endDate: string;
  dates: string[];
};

const DEFAULT_WINDOW_DAYS = 28;

export function buildTimelineWindow(
  anchorDate: string,
  dayCount = DEFAULT_WINDOW_DAYS,
): TimelineWindow {
  const startDate = anchorDate;
  const endDate = addDays(startDate, dayCount - 1);
  return {
    startDate,
    endDate,
    dates: eachDateInRange(startDate, endDate),
  };
}

export function defaultTimelineAnchor(timezone: string | null): string {
  return todayIsoDate(timezone);
}

/** Clip an inclusive bar onto the visible window; null if no overlap. */
export function clipBarToWindow(
  startDate: string,
  endDate: string,
  windowStart: string,
  windowEnd: string,
): { startDate: string; endDate: string } | null {
  if (!startDate || !endDate || endDate < startDate) return null;
  const start = startDate < windowStart ? windowStart : startDate;
  const end = endDate > windowEnd ? windowEnd : endDate;
  if (start > end) return null;
  return { startDate: start, endDate: end };
}

function guestInitials(name: string | null): string | null {
  if (!name) return null;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
}

export function buildTimelineBars(
  bookings: ImportedBooking[],
  blocks: AvailabilityBlock[],
  window: TimelineWindow,
): TimelineBar[] {
  const bars: TimelineBar[] = [];

  for (const booking of bookings) {
    const clipped = clipBarToWindow(
      booking.startDate,
      booking.endDate,
      window.startDate,
      window.endDate,
    );
    if (!clipped) continue;

    const cancelled = booking.status === 'removed';
    const name = booking.guestName?.trim() || 'Guest';
    const code = booking.reservationCode ? ` · ${booking.reservationCode}` : '';

    bars.push({
      id: `booking-${booking.id}`,
      kind: cancelled ? 'cancelled' : 'external',
      label: cancelled ? `${name} (cancelled)` : `${name}${code}`,
      startDate: clipped.startDate,
      endDate: clipped.endDate,
      initials: guestInitials(booking.guestName),
    });
  }

  for (const block of blocks) {
    const clipped = clipBarToWindow(
      block.startDate,
      block.endDate,
      window.startDate,
      window.endDate,
    );
    if (!clipped) continue;

    bars.push({
      id: `block-${block.id}`,
      kind: 'blocked',
      label: block.note?.trim() || reasonLabel(block.reason),
      startDate: clipped.startDate,
      endDate: clipped.endDate,
      initials: null,
    });
  }

  return bars.sort(
    (a, b) =>
      a.startDate.localeCompare(b.startDate) ||
      a.endDate.localeCompare(b.endDate) ||
      a.id.localeCompare(b.id),
  );
}

function reasonLabel(reason: AvailabilityBlock['reason']): string {
  switch (reason) {
    case 'maintenance':
      return 'Maintenance';
    case 'owner_stay':
      return 'Owner stay';
    default:
      return 'Blocked';
  }
}

export function shiftAnchorDate(anchorDate: string, days: number): string {
  return addDays(anchorDate, days);
}

export function formatTimelineMonthLabel(startDate: string, endDate: string): string {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const sameMonth =
    start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }

  const startLabel = start.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  const endLabel = end.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${startLabel} – ${endLabel}`;
}
