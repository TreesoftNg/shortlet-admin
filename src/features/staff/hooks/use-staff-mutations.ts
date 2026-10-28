'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  inviteStaff,
  updateMember,
  revokeInvite,
  suspendMember,
  reactivateMember,
  removeMember,
} from '../api/staff-service';
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

function useStaffAction<T>(mutationFn: (input: T) => Promise<void>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: T) => mutationFn(input),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: queryKeys.staff.all }),
  });
}
export const useRevokeInvite = () => useStaffAction(revokeInvite);
export const useSuspendMember = () => useStaffAction(suspendMember);
export const useReactivateMember = () => useStaffAction(reactivateMember);
export const useRemoveMember = () => useStaffAction(removeMember);
export const useUpdateMember = () =>
  useStaffAction(
    ({
      id,
      values,
    }: {
      id: string;
      values: import('../types').UpdateStaffPayload;
    }) => updateMember(id, values),
  );
