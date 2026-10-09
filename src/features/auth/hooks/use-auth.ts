'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endSession } from '@/shared/api/session';
import { queryKeys } from '@/shared/api/query-keys';
import { useSessionStore } from '@/shared/store/session-store';
import { changePassword, fetchMe, login, logout } from '../api/auth-api';
import type { LoginInput } from '../types';

/** True once the stored session is known and holds a refresh token. */
export function useHasSession(): { ready: boolean; signedIn: boolean } {
  const ready = useSessionStore((state) => state.hasHydrated);
  const signedIn = useSessionStore((state) => Boolean(state.refreshToken));
  return { ready, signedIn };
}

/** The signed-in admin's profile, tenant and permissions. */
export function useMe() {
  const { ready, signedIn } = useHasSession();
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: fetchMe,
    select: (response) => response.data,
    enabled: ready && signedIn,
    staleTime: 5 * 60_000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: ({ data }) => {
      useSessionStore.getState().setTokens(data);
      queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: data.profile });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } catch {
        // Signing out locally must work even if the API is unreachable.
      }
    },
    onSettled: () => {
      endSession();
      queryClient.clear();
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { currentPassword: string; newPassword: string }) =>
      (await changePassword(input)).data,
  });
}
