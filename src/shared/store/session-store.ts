import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const SESSION_STORAGE_KEY = 'sunmade-admin-session';

/** Token pair returned by the API's login and refresh endpoints. */
export type SessionTokens = {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
};

type SessionState = {
  /** Kept in memory only; recovered with the refresh token after a reload. */
  accessToken: string | null;
  /** Epoch milliseconds. */
  accessTokenExpiresAt: number | null;
  /** Persisted so a reload keeps the admin signed in. */
  refreshToken: string | null;
  /** False until the persisted refresh token has been read. */
  hasHydrated: boolean;
  setTokens: (tokens: SessionTokens) => void;
  clear: () => void;
};

const isBrowser = typeof window !== 'undefined';

/**
 * Auth tokens only. Who the user is lives in React Query (`/auth/me`).
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      accessTokenExpiresAt: null,
      refreshToken: null,
      hasHydrated: false,
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          accessTokenExpiresAt: Date.parse(tokens.accessTokenExpiresAt),
          refreshToken: tokens.refreshToken,
        }),
      clear: () =>
        set({ accessToken: null, accessTokenExpiresAt: null, refreshToken: null }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      // Never call `localStorage` during Next.js SSR — createJSONStorage returns
      // undefined when getStorage throws, which leaves `.persist` unset.
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ refreshToken: state.refreshToken }),
      skipHydration: !isBrowser,
    },
  ),
);

// localStorage is read synchronously while the store is created, so mark it
// here rather than in onRehydrateStorage, where the store does not exist yet.
// Only run on the client — SSR has no persist API when storage is unavailable.
if (isBrowser) {
  const markHydrated = () => useSessionStore.setState({ hasHydrated: true });
  if (useSessionStore.persist.hasHydrated()) {
    markHydrated();
  } else {
    useSessionStore.persist.onFinishHydration(markHydrated);
  }

  // Keep tabs in step: a refresh or sign-out in one tab applies to all.
  window.addEventListener('storage', (event) => {
    if (event.key !== SESSION_STORAGE_KEY) return;
    void useSessionStore.persist.rehydrate()?.then(() => {
      if (!useSessionStore.getState().refreshToken) {
        useSessionStore.getState().clear();
      }
    });
  });
}
