import type { PropertyIdFilter } from '@/shared/utils/property-id';
import type { ListBookingsParams } from '../types';
import { todayIso } from './booking-display';

export type BookingTab =
  | 'all'
  | 'upcoming'
  | 'in_stay'
  | 'awaiting_payment'
  | 'cancelled'
  | 'deposits_due'
  | 'deposits_overdue';

export type BookingFilters = {
  tab: BookingTab;
  search: string;
  propertyId: PropertyIdFilter;
  page: number;
  pageSize: number;
};

export const DEFAULT_BOOKING_FILTERS: BookingFilters = {
  tab: 'all',
  search: '',
  propertyId: 'all',
  page: 1,
  pageSize: 20,
};

/** Map UI filters to GET /cc/bookings query params. */
export function toListBookingsParams(
  filters: BookingFilters,
  today = todayIso(),
): ListBookingsParams {
  const params: ListBookingsParams = {
    page: filters.page,
    limit: filters.pageSize,
  };

  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.propertyId !== 'all') {
    params.propertyId = filters.propertyId;
  }

  switch (filters.tab) {
    case 'upcoming':
      params.status = 'confirmed';
      params.from = today;
      break;
    case 'in_stay':
      params.status = 'checked_in';
      break;
    case 'awaiting_payment':
      params.status = 'pending_payment';
      break;
    case 'cancelled':
      params.status = 'cancelled';
      break;
    case 'deposits_due':
      params.deposit = 'due';
      break;
    case 'deposits_overdue':
      params.deposit = 'overdue';
      break;
    case 'all':
    default:
      break;
  }

  return params;
}
