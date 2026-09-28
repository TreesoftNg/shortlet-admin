import type { Guest, Reservation } from '@/shared/types/hospitable';

export type CustomerStatusTab = 'all' | 'with_stays' | 'new';

export type CustomerFilters = {
  tab: CustomerStatusTab;
  search: string;
  location: string | 'all';
};

export type CustomerTabCount = Record<CustomerStatusTab, number>;

export type CustomerListItem = Guest & {
  stays_count: number;
  total_spent: number;
  currency: string;
  last_stay_date: string | null;
  upcoming_stays: number;
};

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  tab: 'all',
  search: '',
  location: 'all',
};

export function buildCustomerList(
  guests: Guest[],
  reservations: Reservation[],
): CustomerListItem[] {
  return guests.map((guest) => {
    const guestReservations = reservations.filter(
      (reservation) => reservation.guest?.id === guest.id,
    );

    const completedOrConfirmed = guestReservations.filter(
      (reservation) =>
        reservation.reservation_status.current.category !== 'cancelled',
    );

    const totalSpent = completedOrConfirmed.reduce(
      (sum, reservation) => sum + (reservation.financials?.total ?? 0),
      0,
    );

    const dates = completedOrConfirmed
      .map((reservation) => reservation.departure_date)
      .sort();
    const lastStayDate = dates.length > 0 ? dates[dates.length - 1] : null;

    const upcomingStays = completedOrConfirmed.filter(
      (reservation) => reservation.arrival_date >= '2026-09-28',
    ).length;

    return {
      ...guest,
      stays_count: completedOrConfirmed.length,
      total_spent: totalSpent,
      currency: completedOrConfirmed[0]?.financials?.currency ?? 'NGN',
      last_stay_date: lastStayDate,
      upcoming_stays: upcomingStays,
    };
  });
}

function matchesTab(customer: CustomerListItem, tab: CustomerStatusTab): boolean {
  if (tab === 'with_stays') return customer.stays_count > 0;
  if (tab === 'new') return customer.stays_count === 0;
  return true;
}

function matchesSearch(customer: CustomerListItem, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    customer.full_name,
    customer.email,
    customer.phone,
    customer.location,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesLocation(
  customer: CustomerListItem,
  location: string | 'all',
): boolean {
  if (location === 'all') return true;
  return customer.location === location;
}

export function countCustomerTabs(customers: CustomerListItem[]): CustomerTabCount {
  return {
    all: customers.length,
    with_stays: customers.filter((item) => item.stays_count > 0).length,
    new: customers.filter((item) => item.stays_count === 0).length,
  };
}

export function filterCustomers(
  customers: CustomerListItem[],
  filters: CustomerFilters,
): CustomerListItem[] {
  return customers.filter(
    (customer) =>
      matchesTab(customer, filters.tab) &&
      matchesSearch(customer, filters.search) &&
      matchesLocation(customer, filters.location),
  );
}

export function getCustomerLocations(customers: CustomerListItem[]): string[] {
  return Array.from(
    new Set(
      customers
        .map((customer) => customer.location)
        .filter((location): location is string => Boolean(location)),
    ),
  ).sort();
}
