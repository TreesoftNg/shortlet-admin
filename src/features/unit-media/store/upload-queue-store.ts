import { create } from 'zustand';
import type { UploadQueueItem, UploadQueueKind } from '../types';

const MAX_PHOTO_CONCURRENCY = 3;
const MAX_VIDEO_CONCURRENCY = 1;

type UploadQueueState = {
  items: UploadQueueItem[];
  enqueue: (files: Array<{ file: File; kind: UploadQueueKind }>) => UploadQueueItem[];
  setProgress: (id: string, progress: number) => void;
  setStatus: (id: string, status: UploadQueueItem['status'], error?: string | null) => void;
  remove: (id: string) => void;
  cancel: (id: string) => void;
  clearFinished: () => void;
  reset: () => void;
};

function newId(): string {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function countActiveUploads(items: UploadQueueItem[]): number {
  return items.filter((item) => item.status === 'queued' || item.status === 'uploading' || item.status === 'processing')
    .length;
}

export function canStartUpload(items: UploadQueueItem[], kind: UploadQueueKind, candidateId: string): boolean {
  const running = items.filter(
    (item) => item.kind === kind && item.status === 'uploading' && item.id !== candidateId,
  ).length;
  const cap = kind === 'photo' ? MAX_PHOTO_CONCURRENCY : MAX_VIDEO_CONCURRENCY;
  return running < cap;
}

export const useUploadQueueStore = create<UploadQueueState>((set, get) => ({
  items: [],
  enqueue: (files) => {
    const added: UploadQueueItem[] = files.map(({ file, kind }) => ({
      id: newId(),
      file,
      kind,
      status: 'queued',
      progress: 0,
      error: null,
      abortController: new AbortController(),
    }));
    set((state) => ({ items: [...state.items, ...added] }));
    return added;
  },
  setProgress: (id, progress) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? { ...item, progress } : item)),
    })),
  setStatus: (id, status, error = null) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status, error, progress: status === 'done' ? 100 : item.progress } : item,
      ),
    })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
  cancel: (id) => {
    const item = get().items.find((entry) => entry.id === id);
    item?.abortController.abort();
    set((state) => ({ items: state.items.filter((entry) => entry.id !== id) }));
  },
  clearFinished: () =>
    set((state) => ({
      items: state.items.filter((item) => item.status !== 'done' && item.status !== 'failed'),
    })),
  reset: () => set({ items: [] }),
}));
