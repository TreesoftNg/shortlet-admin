'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  createProperty,
  updateProperty,
} from '../api/properties-service';
import type { PropertyFormValues } from '../utils/property-form';

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PropertyFormValues) => createProperty(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.units.all }),
      ]);
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: PropertyFormValues;
    }) => updateProperty(id, values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.units.all }),
      ]);
    },
  });
}
