'use client';

import { useMutation } from '@tanstack/react-query';
import { inviteStaff } from '../api/staff-service';
import type { StaffInviteFormValues } from '../utils/staff-invite-form';
import {
  mapInviteToStaffMember,
  toInviteStaffPayload,
} from '../utils/staff-mappers';

export function useInviteStaff() {
  return useMutation({
    mutationFn: async (values: StaffInviteFormValues) => {
      const sent = await inviteStaff(toInviteStaffPayload(values));
      return mapInviteToStaffMember(values, sent);
    },
  });
}
