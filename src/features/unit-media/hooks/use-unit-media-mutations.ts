'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  addVideoLink,
  deleteMedia,
  reorderMedia,
  updateMedia,
} from '../api/unit-media-api';
import type { MediaFields, UnitMedia } from '../types';

function useInvalidateUnitMedia(unitId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.unitMedia.list(unitId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.units.detail(unitId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.units.list() }),
    ]);
}

export function useUpdateMedia(unitId: string) {
  const invalidate = useInvalidateUnitMedia(unitId);
  return useMutation({
    mutationFn: ({
      mediaId,
      input,
    }: {
      mediaId: string;
      input: { caption?: string | null; altText?: string | null; isCover?: true };
    }) => updateMedia(unitId, mediaId, input),
    onSuccess: invalidate,
  });
}

export function useReorderMedia(unitId: string) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.unitMedia.list(unitId);

  return useMutation({
    mutationFn: (mediaIds: string[]) => reorderMedia(unitId, mediaIds),
    onMutate: async (mediaIds) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<UnitMedia[]>(listKey);
      if (previous) {
        const byId = new Map(previous.map((item) => [item.id, item]));
        queryClient.setQueryData(
          listKey,
          mediaIds
            .map((id, index) => {
              const item = byId.get(id);
              return item ? { ...item, sortOrder: index } : null;
            })
            .filter((item): item is UnitMedia => item !== null),
        );
      }
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) queryClient.setQueryData(listKey, context.previous);
    },
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: listKey }),
        queryClient.invalidateQueries({ queryKey: queryKeys.units.detail(unitId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.units.list() }),
      ]),
  });
}

export function useDeleteMedia(unitId: string) {
  const invalidate = useInvalidateUnitMedia(unitId);
  return useMutation({
    mutationFn: (mediaId: string) => deleteMedia(unitId, mediaId),
    onSuccess: invalidate,
  });
}

export function useAddVideoLink(unitId: string) {
  const invalidate = useInvalidateUnitMedia(unitId);
  return useMutation({
    mutationFn: (input: { url: string } & MediaFields) => addVideoLink(unitId, input),
    onSuccess: invalidate,
  });
}
