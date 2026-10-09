/** Shapes returned by `GET /cc/availability/calendar` (shortlet-api). */

export type CalendarEventKind =
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'awaiting_payment'
  | 'external'
  | 'blocked';

export type CalendarRange = 'week' | '2weeks' | 'month';

export type CalendarUnitRow = {
  id: string;
  name: string;
  publicName: string | null;
  code: string | null;
  subtitle: string;
  propertyId: string | null;
  propertyName: string | null;
  status: 'active' | 'maintenance' | 'closed' | 'archived';
  openForBooking: boolean;
  minNights: number;
  maxNights: number | null;
  /** Nightly rate per date (`YYYY-MM-DD`); null when the unit has no base rate. */
  rates: Record<string, string | null>;
};

export type CalendarEvent = {
  id: string;
  unitId: string;
  kind: CalendarEventKind;
  /** First night. */
  startDate: string;
  /** Check-out day (exclusive): the last night is the day before. */
  endDate: string;
  /** Overlaps another event on the same unit. */
  conflict: boolean;
  label: string;
  initials: string | null;
  bookingId: string | null;
  reference: string | null;
  externalEventId: string | null;
  reservationCode: string | null;
  channel: string | null;
  blockId: string | null;
  blockReason: 'maintenance' | 'owner_stay' | 'other' | null;
  blockNote: string | null;
};

export type AvailabilityCalendar = {
  from: string;
  /** Exclusive. */
  to: string;
  today: string;
  currency: string;
  units: CalendarUnitRow[];
  events: CalendarEvent[];
};

/** Nights picked on one unit's row: `[startDate, endDate)`. */
export type NightSelection = {
  unitId: string;
  startDate: string;
  endDate: string;
};
