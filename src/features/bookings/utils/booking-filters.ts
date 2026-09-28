import type { Reservation } from '@/shared/types/hospitable';

export type BookingTab = 'all' | 'upcoming' | 'awaiting_payment' | 'cancelled';

export type BookingFilters = {
  tab: BookingTab;
  search: string;
  propertyId: string | 'all';
  /** YYYY-MM, e.g. 2026-10 */
  month: string | 'all';
  page: number;
  pageSize: number;
};

export type BookingTabCount = Record<BookingTab, number>;

export const DEFAULT_BOOKING_FILTERS: BookingFilters = {
  tab: 'all',
  search: '',
  propertyId: 'all',
  month: 'all',
  page: 1,
  pageSize: 8,
};

function matchesTab(reservation: Reservation, tab: BookingTab, today: string): boolean {
  const { category, sub_category } = reservation.reservation_status.current;

  switch (tab) {
    case 'upcoming':
      return (
        category !== 'cancelled' &&
        sub_category !== 'completed' &&
        reservation.arrival_date >= today
      );
    case 'awaiting_payment':
      return sub_category === 'request for payment';
    case 'cancelled':
      return category === 'cancelled';
    case 'all':
    default:
      return true;
  }
}

function matchesSearch(reservation: Reservation, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    reservation.platform_id,
    reservation.guest?.full_name,
    reservation.guest?.email,
    reservation.property?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesProperty(reservation: Reservation, propertyId: string | 'all'): boolean {
  if (propertyId === 'all') return true;
  return reservation.property?.id === propertyId;
}

function matchesMonth(reservation: Reservation, month: string | 'all'): boolean {
  if (month === 'all') return true;
  return (
    reservation.arrival_date.startsWith(month) ||
    reservation.departure_date.startsWith(month)
  );
}

export function countBookingTabs(
  reservations: Reservation[],
  today = '2026-09-28',
): BookingTabCount {
  return {
    all: reservations.length,
    upcoming: reservations.filter((item) => matchesTab(item, 'upcoming', today)).length,
    awaiting_payment: reservations.filter((item) =>
      matchesTab(item, 'awaiting_payment', today),
    ).length,
    cancelled: reservations.filter((item) => matchesTab(item, 'cancelled', today)).length,
  };
}

export function filterReservations(
  reservations: Reservation[],
  filters: BookingFilters,
  today = '2026-09-28',
): Reservation[] {
  return reservations.filter(
    (reservation) =>
      matchesTab(reservation, filters.tab, today) &&
      matchesSearch(reservation, filters.search) &&
      matchesProperty(reservation, filters.propertyId) &&
      matchesMonth(reservation, filters.month),
  );
}

export function paginateReservations<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; total: number; totalPages: number; page: number } {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage,
  };
}
