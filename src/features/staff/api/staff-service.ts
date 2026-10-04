import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { InviteStaffPayload, SentStaffInvite } from '../types';

/** POST /cc/staff-invites — owner only; resending the same email replaces the link. */
export async function inviteStaff(
  payload: InviteStaffPayload,
): Promise<SentStaffInvite> {
  const response = await apiClient<SentStaffInvite>(adminPath('/staff-invites'), {
    method: 'POST',
    body: payload,
  });
  return response.data;
}
