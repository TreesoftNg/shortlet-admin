import { screen, waitFor } from '@testing-library/react';
import { useSessionStore } from '@/shared/store/session-store';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import * as authApi from '../api/auth-api';
import { RequireSession } from './require-session';

jest.mock('../api/auth-api');
const api = jest.mocked(authApi);

const replace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => '/calendar-sync',
}));

const profile = {
  user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
  tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
  role: { code: 'owner', name: 'Owner' },
  permissions: [],
};

describe('RequireSession', () => {
  beforeEach(() => jest.resetAllMocks());

  it('sends signed-out visitors to login, remembering the page', async () => {
    useSessionStore.setState({ refreshToken: null, hasHydrated: true });
    renderWithProviders(<RequireSession>secret page</RequireSession>);

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/login?next=%2Fcalendar-sync'));
    expect(screen.queryByText('secret page')).not.toBeInTheDocument();
  });

  it('waits for the stored session before deciding', () => {
    useSessionStore.setState({ refreshToken: null, hasHydrated: false });
    renderWithProviders(<RequireSession>secret page</RequireSession>);

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('shows the page once the profile has loaded', async () => {
    useSessionStore.setState({ refreshToken: 'refresh', hasHydrated: true });
    api.fetchMe.mockResolvedValue({ success: true, data: profile });
    renderWithProviders(<RequireSession>secret page</RequireSession>);

    expect(await screen.findByText('secret page')).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
