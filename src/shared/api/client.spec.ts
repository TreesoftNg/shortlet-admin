import { apiClient } from './client';
import { onSessionExpired } from './session';
import { ApiClientError } from './types';
import { useSessionStore } from '@/shared/store/session-store';

const API = 'http://api.test/api/v1';

type Reply = { status: number; body: unknown };
const ok = (data: unknown): Reply => ({ status: 200, body: { success: true, data } });
const fail = (status: number, code: string, message = code): Reply => ({
  status,
  body: { success: false, error: { code, message } },
});

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();
function reply(...replies: Reply[]) {
  for (const { status, body } of replies) {
    fetchMock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
    } as Response);
  }
}
const calls = () => fetchMock.mock.calls.map(([url, init]) => ({ url, init }));
const authHeader = (index: number) => (calls()[index].init.headers as Record<string, string>).Authorization;

const freshTokens = {
  accessToken: 'access-2',
  accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
  refreshToken: 'refresh-2',
};

function signIn(accessTokenExpiresInMs = 10 * 60_000) {
  useSessionStore.setState({
    accessToken: 'access-1',
    accessTokenExpiresAt: Date.now() + accessTokenExpiresInMs,
    refreshToken: 'refresh-1',
  });
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = API;
  global.fetch = fetchMock as unknown as typeof fetch;
});

beforeEach(() => {
  fetchMock.mockReset();
  localStorage.clear();
  useSessionStore.setState({ accessToken: null, accessTokenExpiresAt: null, refreshToken: null });
});

describe('apiClient', () => {
  it('sends the access token and returns the envelope', async () => {
    signIn();
    reply(ok({ id: 'u1' }));

    await expect(apiClient('/auth/me')).resolves.toEqual({ success: true, data: { id: 'u1' } });
    expect(calls()[0].url).toBe(`${API}/auth/me`);
    expect(authHeader(0)).toBe('Bearer access-1');
  });

  it('skips the token for public endpoints', async () => {
    reply(ok({}));

    await apiClient('/auth/login', { method: 'POST', body: { email: 'a' }, auth: false });

    expect(calls()[0].init.headers).not.toHaveProperty('Authorization');
    expect(calls()[0].init.body).toBe(JSON.stringify({ email: 'a' }));
  });

  it('refreshes an access token that is about to expire before sending', async () => {
    signIn(10_000);
    reply(ok(freshTokens), ok('data'));

    await apiClient('/admin/calendar/units');

    expect(calls()[0].url).toBe(`${API}/auth/refresh`);
    expect(JSON.parse(calls()[0].init.body as string)).toEqual({ refreshToken: 'refresh-1' });
    expect(authHeader(1)).toBe('Bearer access-2');
    expect(useSessionStore.getState().refreshToken).toBe('refresh-2');
  });

  it('refreshes once and retries when the API rejects the token', async () => {
    signIn();
    reply(fail(401, 'INVALID_TOKEN'), ok(freshTokens), ok('data'));

    await expect(apiClient('/auth/me')).resolves.toMatchObject({ data: 'data' });
    expect(calls().map((call) => call.url)).toEqual([`${API}/auth/me`, `${API}/auth/refresh`, `${API}/auth/me`]);
    expect(authHeader(2)).toBe('Bearer access-2');
  });

  it('shares one refresh between concurrent requests', async () => {
    signIn(0);
    reply(ok(freshTokens), ok('a'), ok('b'));

    await Promise.all([apiClient('/a'), apiClient('/b')]);

    expect(calls().filter((call) => call.url.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('signs out when the refresh token is rejected', async () => {
    signIn(0);
    const expired = jest.fn();
    const unsubscribe = onSessionExpired(expired);
    reply(fail(401, 'INVALID_TOKEN'));

    await expect(apiClient('/auth/me')).rejects.toMatchObject({ code: 'AUTHENTICATION_REQUIRED' });
    expect(useSessionStore.getState()).toMatchObject({ accessToken: null, refreshToken: null });
    expect(expired).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it('keeps the session when the refresh fails for another reason', async () => {
    signIn(0);
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(apiClient('/auth/me')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
    expect(useSessionStore.getState().refreshToken).toBe('refresh-1');
  });

  it('does not call the API when signed out', async () => {
    await expect(apiClient('/auth/me')).rejects.toBeInstanceOf(ApiClientError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('passes API errors through with their code and details', async () => {
    signIn();
    reply({
      status: 409,
      body: { success: false, error: { code: 'RESOURCE_CONFLICT', message: 'Overlaps', details: { id: 'b1' } } },
    });

    await expect(apiClient('/x', { method: 'POST' })).rejects.toMatchObject({
      code: 'RESOURCE_CONFLICT',
      status: 409,
      message: 'Overlaps',
      details: { id: 'b1' },
    });
  });
});

describe('session store', () => {
  it('persists only the refresh token', () => {
    useSessionStore.getState().setTokens(freshTokens);

    const stored = JSON.parse(localStorage.getItem('sunmade-admin-session') ?? '{}');
    expect(stored.state).toEqual({ refreshToken: 'refresh-2' });
    expect(JSON.stringify(stored)).not.toContain('access-2');
  });
});
