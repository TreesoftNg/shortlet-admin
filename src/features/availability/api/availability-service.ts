import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { AvailabilityCalendar, CalendarRange } from '@/shared/types/hospitable';

export type AvailabilityCalendarParams = {
  anchorDate: string;
  range: CalendarRange;
  propertyId?: number | 'all';
};

export async function fetchAvailabilityCalendar(params: AvailabilityCalendarParams) {
  if (isMockMode()) {
    return mockApi.getAvailabilityCalendar(params);
  }

  const query = new URLSearchParams({
    anchorDate: params.anchorDate,
    range: params.range,
    propertyId:
      params.propertyId === undefined || params.propertyId === 'all'
        ? 'all'
        : String(params.propertyId),
  });

  return apiClient<AvailabilityCalendar>(`/availability/calendar?${query.toString()}`);
}
