import { mockApi } from '@/mocks/api';
import type { CalendarRange } from '@/shared/types/hospitable';
import type { PropertyIdFilter } from '@/shared/utils/property-id';

// Local mock data until this feature is connected to the Shortlet API.

export type AvailabilityCalendarParams = {
  anchorDate: string;
  range: CalendarRange;
  propertyId?: PropertyIdFilter;
};

export function fetchAvailabilityCalendar(params: AvailabilityCalendarParams) {
  return mockApi.getAvailabilityCalendar(params);
}
