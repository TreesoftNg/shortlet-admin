import type { Customer } from '../types';

export type CustomerStatusTab = 'all' | 'with_stays' | 'new';

export type CustomerFilters = {
  tab: CustomerStatusTab;
  search: string;
  location: string | 'all';
};

export type CustomerTabCount = Record<CustomerStatusTab, number>;

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  tab: 'all',
  search: '',
  location: 'all',
};

export function isReturningGuest(customer: Customer): boolean {
  return customer.status === 'guest' || customer.staysCount > 0;
}

function matchesTab(customer: Customer, tab: CustomerStatusTab): boolean {
  if (tab === 'with_stays') return isReturningGuest(customer);
  if (tab === 'new') return !isReturningGuest(customer);
  return true;
}

function matchesSearch(customer: Customer, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [customer.fullName, customer.email, customer.phone, customer.location]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesLocation(customer: Customer, location: string | 'all'): boolean {
  if (location === 'all') return true;
  return customer.location === location;
}

export function countCustomerTabs(customers: Customer[]): CustomerTabCount {
  return {
    all: customers.length,
    with_stays: customers.filter(isReturningGuest).length,
    new: customers.filter((item) => !isReturningGuest(item)).length,
  };
}

export function filterCustomers(customers: Customer[], filters: CustomerFilters): Customer[] {
  return customers.filter(
    (customer) =>
      matchesTab(customer, filters.tab) &&
      matchesSearch(customer, filters.search) &&
      matchesLocation(customer, filters.location),
  );
}

export function getCustomerLocations(customers: Customer[]): string[] {
  return Array.from(
    new Set(
      customers
        .map((customer) => customer.location)
        .filter((location): location is string => Boolean(location)),
    ),
  ).sort();
}
