'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import {
  completeVideoUpload,
  putToStorage,
  requestVideoUpload,
  uploadPhoto,
} from '../api/unit-media-api';
import { captureVideoPoster } from '../utils/video-poster';
import { useUploadQueueStore } from '../store/upload-queue-store';
import type { UploadQueueItem } from '../types';

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Upload failed';
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function useUploadQueueRunner(unitId: string) {
  const queryClient = useQueryClient();
  const running = useRef(new Set<string>());

  const processItem = useCallback(
    async (item: UploadQueueItem) => {
      if (running.current.has(item.id)) return;
      running.current.add(item.id);
      const store = useUploadQueueStore.getState();
      store.setStatus(item.id, 'uploading');

      try {
        const signal = item.abortController.signal;
        const onProgress = (percent: number) => store.setProgress(item.id, percent);
        if (item.kind === 'photo') {
          await uploadPhoto(unitId, item.file, {}, onProgress, signal);
        } else {
          const ticket = await requestVideoUpload(unitId, {
            contentType: 'video/mp4',
            sizeBytes: item.file.size,
          });
          await putToStorage(ticket.uploadUrl, item.file, ticket.headers, { onProgress, signal });
          store.setStatus(item.id, 'processing');
          const { poster, durationSeconds } = await captureVideoPoster(item.file);
          await completeVideoUpload(unitId, ticket.mediaId, poster, durationSeconds, undefined, signal);
        }
        store.setStatus(item.id, 'done');
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.unitMedia.list(unitId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.units.detail(unitId) }),
          queryClient.invalidateQueries({ queryKey: queryKeys.units.list() }),
        ]);
      } catch (error) {
        if (isAbort(error)) return;
        useUploadQueueStore.getState().setStatus(item.id, 'failed', errorMessage(error));
      } finally {
        running.current.delete(item.id);
      }
    },
    [queryClient, unitId],
  );

  const pump = useCallback(() => {
    const items = useUploadQueueStore.getState().items;
    let photoRunning = items.filter((item) => item.kind === 'photo' && item.status === 'uploading').length;
    let videoRunning = items.filter(
      (item) => item.kind === 'video' && (item.status === 'uploading' || item.status === 'processing'),
    ).length;

    for (const item of items) {
      if (item.status !== 'queued') continue;
      if (item.kind === 'photo') {
        if (photoRunning >= 3) continue;
        photoRunning += 1;
      } else {
        if (videoRunning >= 1) continue;
        videoRunning += 1;
      }
      void processItem(item);
    }
  }, [processItem]);

  useEffect(() => {
    return useUploadQueueStore.subscribe(pump);
  }, [pump]);

  useEffect(() => {
    pump();
  }, [pump]);

  const retry = useCallback(
    (id: string) => {
      const item = useUploadQueueStore.getState().items.find((entry) => entry.id === id);
      if (!item) return;
      const next: UploadQueueItem = {
        ...item,
        status: 'queued',
        progress: 0,
        error: null,
        abortController: new AbortController(),
      };
      useUploadQueueStore.setState((state) => ({
        items: state.items.map((entry) => (entry.id === id ? next : entry)),
      }));
    },
    [],
  );

  return { retry };
}
