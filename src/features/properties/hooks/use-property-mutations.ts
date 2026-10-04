'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  archiveProperty,
  createProperty,
  restoreProperty,
  updateProperty,
} from '../api/properties-service';
import type { PropertyFormValues } from '../utils/property-form';

function useRefreshProperties() {
  const queryClient = useQueryClient();
  return (id?: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
      ...(id
        ? [
            queryClient.invalidateQueries({
              queryKey: queryKeys.properties.detail(id),
            }),
          ]
        : []),
      queryClient.invalidateQueries({ queryKey: queryKeys.units.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.availability.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarSync.all }),
    ]);
}

export function useCreateProperty() {
  const refresh = useRefreshProperties();
  return useMutation({
    mutationFn: (values: PropertyFormValues) => createProperty(values),
    onSuccess: () => refresh(),
  });
}

export function useUpdateProperty() {
  const refresh = useRefreshProperties();
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PropertyFormValues }) =>
      updateProperty(id, values),
    onSuccess: (_property, variables) => refresh(variables.id),
  });
}

export function useArchiveProperty() {
  const refresh = useRefreshProperties();
  return useMutation({
    mutationFn: (id: string) => archiveProperty(id),
    onSuccess: (_property, id) => refresh(id),
  });
}

export function useRestoreProperty() {
  const refresh = useRefreshProperties();
  return useMutation({
    mutationFn: (id: string) => restoreProperty(id),
    onSuccess: (_property, id) => refresh(id),
  });
}
