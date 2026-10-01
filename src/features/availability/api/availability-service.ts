import { mockApi } from '@/mocks/api';
import type { CalendarRange } from '@/shared/types/hospitable';

// Local mock data until this feature is connected to the Shortlet API.

export type AvailabilityCalendarParams = {
  anchorDate: string;
  range: CalendarRange;
  propertyId?: number | 'all';
};

export function fetchAvailabilityCalendar(params: AvailabilityCalendarParams) {
  return mockApi.getAvailabilityCalendar(params);
}
