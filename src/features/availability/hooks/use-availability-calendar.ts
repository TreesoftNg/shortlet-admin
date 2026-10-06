'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  fetchAvailabilityCalendar,
  type AvailabilityCalendarParams,
} from '../api/availability-service';

export function useAvailabilityCalendar(params: AvailabilityCalendarParams) {
  return useQuery({
    queryKey: queryKeys.availability.calendar(params),
    queryFn: () => fetchAvailabilityCalendar(params),
    // Keep the grid on screen while the next range loads.
    placeholderData: keepPreviousData,
  });
}
