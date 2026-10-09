'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { inviteStaff } from '../api/staff-service';
import type { StaffInviteFormValues } from '../utils/staff-invite-form';
import {
  mapInviteToStaffMember,
  toInviteStaffPayload,
} from '../utils/staff-mappers';

export function useInviteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: StaffInviteFormValues) => {
      const sent = await inviteStaff(toInviteStaffPayload(values));
      return mapInviteToStaffMember(values, sent);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    },
  });
}
