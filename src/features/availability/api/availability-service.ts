import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { PropertyIdFilter } from '@/shared/utils/property-id';
import type { AvailabilityCalendar } from '../types';

export type AvailabilityCalendarParams = {
  from: string;
  /** Exclusive. */
  to: string;
  propertyId?: PropertyIdFilter;
};

export async function fetchAvailabilityCalendar(
  params: AvailabilityCalendarParams,
): Promise<AvailabilityCalendar> {
  const query = new URLSearchParams({ from: params.from, to: params.to });
  if (params.propertyId && params.propertyId !== 'all') {
    query.set('propertyId', params.propertyId);
  }
  const response = await apiClient<AvailabilityCalendar>(
    adminPath(`/availability/calendar?${query.toString()}`),
  );
  return response.data;
}
