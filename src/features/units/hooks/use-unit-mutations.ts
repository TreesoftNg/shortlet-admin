'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { createUnit, updateUnit } from '../api/units-service';
import type { UnitFormValues } from '../utils/unit-form';

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UnitFormValues) => createUnit(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.units.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.calendarSync.all }),
      ]);
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UnitFormValues }) =>
      updateUnit(id, values),
    onSuccess: async (_unit, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.units.all }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.units.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.availability.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.calendarSync.all }),
      ]);
    },
  });
}
