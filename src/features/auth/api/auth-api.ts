import { apiClient } from '@/shared/api/client';
import type { AdminProfile, LoginInput, LoginResult } from '../types';

export function login(input: LoginInput) {
  return apiClient<LoginResult>('/auth/login', { method: 'POST', body: input, auth: false });
}

export function logout() {
  return apiClient<null>('/auth/logout', { method: 'POST' });
}

export function fetchMe() {
  return apiClient<AdminProfile>('/auth/me');
}
