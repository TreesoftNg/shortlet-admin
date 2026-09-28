'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  fetchAvailabilityCalendar,
  type AvailabilityCalendarParams,
} from '../api/availability-service';

export function useAvailabilityCalendar(params: AvailabilityCalendarParams) {
  return useQuery({
    queryKey: queryKeys.availability.calendar(params),
    queryFn: () => fetchAvailabilityCalendar(params),
    select: (response) => response.data,
  });
}
