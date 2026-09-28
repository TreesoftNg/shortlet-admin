import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAccessTokenGetter } from '@/shared/api/client';

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roleLabel: string;
  avatarUrl: string | null;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  }) => void;
  clearSession: () => void;
};

/**
 * Auth/session only — server data belongs in React Query.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: {
        id: 'usr-admin-001',
        firstName: 'Kemi',
        lastName: 'Adeyemi',
        email: 'kemi@haven.ng',
        roleLabel: 'Tenant Admin',
        avatarUrl: 'https://i.pravatar.cc/100?img=68',
      },
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'shortlet-admin-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);

setAccessTokenGetter(() => useAuthStore.getState().accessToken);
