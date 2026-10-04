import { type SessionTokens, useSessionStore } from '@/shared/store/session-store';
import { sendRequest } from './http';
import { adminPath } from './paths';
import { ApiClientError } from './types';

/** Refresh a little early so a token never expires mid-request. */
const EXPIRY_MARGIN_MS = 30_000;
const REFRESH_LOCK_NAME = 'sunmade-admin-token-refresh';

type Listener = () => void;
const sessionExpiredListeners = new Set<Listener>();
let refreshInFlight: Promise<string | null> | null = null;

/** Called when the session can no longer be renewed (signed out elsewhere, expired, revoked). */
export function onSessionExpired(listener: Listener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

export function endSession(): void {
  useSessionStore.getState().clear();
  sessionExpiredListeners.forEach((listener) => listener());
}

/** A usable access token, refreshing it first when needed; null when signed out. */
export async function getAccessToken(): Promise<string | null> {
  const { accessToken, accessTokenExpiresAt, refreshToken } = useSessionStore.getState();
  if (accessToken && accessTokenExpiresAt && accessTokenExpiresAt - EXPIRY_MARGIN_MS > Date.now()) {
    return accessToken;
  }
  return refreshToken ? refreshAccessToken() : null;
}

/**
 * Exchanges the refresh token for a new pair. Concurrent callers share one
 * request, and tabs take turns (Web Locks) because the API ends the whole
 * session if a refresh token is ever used twice.
 */
export function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= withRefreshLock(runRefresh).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function runRefresh(): Promise<string | null> {
  // Another tab may have rotated the token while this one waited.
  await useSessionStore.persist.rehydrate();
  const { refreshToken } = useSessionStore.getState();
  if (!refreshToken) {
    endSession();
    return null;
  }

  try {
    const { data } = await sendRequest<SessionTokens>(adminPath('/auth/refresh'), {
      method: 'POST',
      body: { refreshToken },
    });
    useSessionStore.getState().setTokens(data);
    return data.accessToken;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      endSession();
      return null;
    }
    // Offline or server trouble: keep the session and let the caller retry.
    throw error;
  }
}

async function withRefreshLock<T>(work: () => Promise<T>): Promise<T> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  return locks ? await locks.request(REFRESH_LOCK_NAME, work) : work();
}
