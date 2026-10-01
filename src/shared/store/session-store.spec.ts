describe('useSessionStore hydration', () => {
  beforeEach(() => localStorage.clear());

  const loadFreshStore = () => {
    let store: typeof import('./session-store') | undefined;
    jest.isolateModules(() => {
      store = require('./session-store');
    });
    return store!.useSessionStore;
  };

  it('is marked hydrated after reading an empty storage', () => {
    expect(loadFreshStore().getState()).toMatchObject({ hasHydrated: true, refreshToken: null });
  });

  it('restores the refresh token but never an access token', () => {
    localStorage.setItem(
      'sunmade-admin-session',
      JSON.stringify({ state: { refreshToken: 'refresh-1', accessToken: 'leaked' }, version: 0 }),
    );

    const state = loadFreshStore().getState();
    expect(state).toMatchObject({ hasHydrated: true, refreshToken: 'refresh-1' });
  });
});
