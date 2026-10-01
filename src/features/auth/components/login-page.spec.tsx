import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiClientError } from '@/shared/api/types';
import { useSessionStore } from '@/shared/store/session-store';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import * as authApi from '../api/auth-api';
import { LoginPage } from './login-page';

jest.mock('../api/auth-api');
const api = jest.mocked(authApi);

const replace = jest.fn();
let search = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => search,
}));

const result = {
  tokenType: 'Bearer' as const,
  accessToken: 'access',
  accessTokenExpiresAt: new Date(Date.now() + 900_000).toISOString(),
  refreshToken: 'refresh',
  refreshTokenExpiresAt: new Date(Date.now() + 86_400_000).toISOString(),
  profile: {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions: [],
  },
};

async function fillAndSubmit() {
  await userEvent.type(screen.getByLabelText(/email/i), 'ada@example.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'a-long-password');
  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    search = new URLSearchParams();
    useSessionStore.setState({ accessToken: null, accessTokenExpiresAt: null, refreshToken: null, hasHydrated: true });
  });

  it('signs in, stores the session and goes to the requested page', async () => {
    search = new URLSearchParams({ next: '/calendar-sync' });
    api.login.mockResolvedValue({ success: true, data: result });
    renderWithProviders(<LoginPage />);

    await fillAndSubmit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/calendar-sync'));
    expect(api.login).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'a-long-password', tenantSlug: undefined });
    expect(useSessionStore.getState()).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('never redirects off-site', async () => {
    search = new URLSearchParams({ next: 'https://evil.example' });
    api.login.mockResolvedValue({ success: true, data: result });
    renderWithProviders(<LoginPage />);

    await fillAndSubmit();

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/'));
  });

  it('shows the API error', async () => {
    api.login.mockRejectedValue(
      new ApiClientError('Email or password is incorrect', { code: 'INVALID_CREDENTIALS', status: 401 }),
    );
    renderWithProviders(<LoginPage />);

    await fillAndSubmit();

    expect(await screen.findByText('Email or password is incorrect')).toBeInTheDocument();
    expect(useSessionStore.getState().refreshToken).toBeNull();
  });

  it('asks which business when the account has several', async () => {
    api.login
      .mockRejectedValueOnce(
        new ApiClientError('Choose', {
          code: 'TENANT_REQUIRED',
          status: 400,
          details: { tenants: [{ slug: 'sunmade', name: 'Sunmade' }, { slug: 'other', name: 'Other Stays' }] },
        }),
      )
      .mockResolvedValueOnce({ success: true, data: result });
    renderWithProviders(<LoginPage />);

    await fillAndSubmit();
    fireEvent.change(await screen.findByLabelText(/business/i), { target: { value: 'other' } });
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(api.login).toHaveBeenLastCalledWith(expect.objectContaining({ tenantSlug: 'other' })));
  });

  it('explains an ended session', () => {
    search = new URLSearchParams({ expired: '1' });
    renderWithProviders(<LoginPage />);

    expect(screen.getByText(/session ended/i)).toBeInTheDocument();
  });
});
