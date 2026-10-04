'use client';

import { useCallback, useEffect, useState } from 'react';
import type { StaffMember } from '@/shared/types/hospitable';
import {
  loadPendingInvites,
  savePendingInvites,
} from '../utils/pending-invites';
import { upsertPendingInvite } from '../utils/staff-mappers';

export function usePendingInvites(tenantId: string | undefined) {
  const [pending, setPending] = useState<StaffMember[]>([]);

  useEffect(() => {
    setPending(loadPendingInvites(tenantId));
  }, [tenantId]);

  const recordInvite = useCallback(
    (invite: StaffMember) => {
      if (!tenantId) return;
      setPending((current) => {
        const next = upsertPendingInvite(current, invite);
        savePendingInvites(tenantId, next);
        return next;
      });
    },
    [tenantId],
  );

  return { pending, recordInvite };
}
