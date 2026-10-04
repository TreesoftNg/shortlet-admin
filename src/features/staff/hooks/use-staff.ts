'use client';

import { useMemo } from 'react';
import { useMe } from '@/features/auth/hooks/use-auth';
import { mergeStaffDirectory, mapProfileToStaffMember } from '../utils/staff-mappers';
import { usePendingInvites } from './use-pending-invites';

export function useStaff() {
  const me = useMe();
  const { pending, recordInvite } = usePendingInvites(me.data?.tenant.id);

  const members = useMemo(() => {
    if (!me.data) return [];
    return mergeStaffDirectory(mapProfileToStaffMember(me.data), pending);
  }, [me.data, pending]);

  return {
    ...me,
    data: members,
    recordInvite,
  };
}
