'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  archiveFacility,
  createFacility,
  restoreFacility,
  updateFacility,
} from '../api/facilities-service';
import type { FacilityInput } from '../types';

function useInvalidateFacilities() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.facilities.all });
}

export function useCreateFacility() {
  const invalidate = useInvalidateFacilities();
  return useMutation({
    mutationFn: (input: FacilityInput) => createFacility(input),
    onSuccess: invalidate,
  });
}

export function useUpdateFacility() {
  const invalidate = useInvalidateFacilities();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: FacilityInput }) =>
      updateFacility(id, input),
    onSuccess: invalidate,
  });
}

export function useArchiveFacility() {
  const invalidate = useInvalidateFacilities();
  return useMutation({
    mutationFn: (id: string) => archiveFacility(id),
    onSuccess: invalidate,
  });
}

export function useRestoreFacility() {
  const invalidate = useInvalidateFacilities();
  return useMutation({
    mutationFn: (id: string) => restoreFacility(id),
    onSuccess: invalidate,
  });
}
