'use client';

import { useEffect } from 'react';
import { countActiveUploads, useUploadQueueStore } from '../store/upload-queue-store';

/** Warns on refresh/close and intercepts in-app link clicks while uploads run. */
export function useLeaveUploadGuard() {
  const active = useUploadQueueStore((state) => countActiveUploads(state.items) > 0);

  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest('a');
      if (!link || link.target === '_blank' || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!window.confirm('Uploads are still in progress. Leave this page anyway?')) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [active]);

  const confirmLeave = () =>
    !active || window.confirm('Uploads are still in progress. Leave this page anyway?');

  return { active, confirmLeave };
}
