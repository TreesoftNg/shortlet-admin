'use client';

import { useQuery } from '@tanstack/react-query';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchStaff } from '../api/staff-service';
import { mapStaffListItemToMember } from '../utils/staff-mappers';

type UseStaffOptions = {
  enabled?: boolean;
};

export function useStaff(options: UseStaffOptions = {}) {
  const { data: profile } = useMe();
  const canRead = hasPermission(profile, 'staff.read');
  const enabled = (options.enabled ?? true) && canRead;

  return useQuery({
    queryKey: queryKeys.staff.list(),
    queryFn: fetchStaff,
    enabled,
    select: (rows) =>
      rows.map((row) => mapStaffListItemToMember(row, profile?.user.id)),
  });
}
