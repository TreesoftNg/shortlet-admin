import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { AdminProfile, LoginInput, LoginResult } from '../types';

export function login(input: LoginInput) {
  return apiClient<LoginResult>(adminPath('/auth/login'), { method: 'POST', body: input, auth: false });
}

export function logout() {
  return apiClient<null>(adminPath('/auth/logout'), { method: 'POST' });
}

export function fetchMe() {
  return apiClient<AdminProfile>(adminPath('/auth/me'));
}

export type StaffInvitePreview = {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName: string;
  tenantName: string;
};

export function fetchStaffInvite(token: string) {
  return apiClient<StaffInvitePreview>(
    `/staff-invites/preview?token=${encodeURIComponent(token)}`,
    { auth: false },
  );
}

export function acceptStaffInvite(input: { token: string; password: string }) {
  return apiClient<{ email: string; tenantSlug: string }>('/staff-invites/accept', {
    method: 'POST',
    body: input,
    auth: false,
  });
}
