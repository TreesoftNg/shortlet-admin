import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as authApi from '@/features/auth/api/auth-api';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import { AccountPage } from './account-page';

jest.mock('@/features/auth/api/auth-api');
const api = jest.mocked(authApi);

const profile: AdminProfile = {
  user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
  tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade Apartments & Suites' },
  role: { code: 'manager', name: 'Manager' },
  permissions: [],
};

function renderPage() {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<AccountPage />, queryClient);
}

async function fill(current: string, next: string, confirm = next) {
  await userEvent.type(screen.getByLabelText('Current password'), current);
  await userEvent.type(screen.getByLabelText('New password'), next);
  await userEvent.type(screen.getByLabelText('Confirm new password'), confirm);
  await userEvent.click(screen.getByRole('button', { name: 'Change password' }));
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe('AccountPage', () => {
  it('shows who is signed in', () => {
    renderPage();
    expect(screen.getByText('Ada Okafor')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Sunmade Apartments & Suites')).toBeInTheDocument();
  });

  it('checks the new password before sending it', async () => {
    renderPage();
    await fill('Old-pass-1!', 'weak', 'other');
    expect(screen.getByText('At least 8 characters, with an uppercase letter and a special character.')).toBeInTheDocument();
    expect(screen.getByText('The two passwords do not match.')).toBeInTheDocument();
    expect(api.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password, clears the form and says other devices were signed out', async () => {
    api.changePassword.mockResolvedValue({ success: true, data: { otherSessionsSignedOut: 2 } } as never);
    renderPage();
    await fill('Old-pass-1!', 'New-pass-2!');
    await waitFor(() =>
      expect(api.changePassword).toHaveBeenCalledWith({ currentPassword: 'Old-pass-1!', newPassword: 'New-pass-2!' }),
    );
    expect(await screen.findByText('Password changed')).toBeInTheDocument();
    expect(screen.getByText("You're still signed in here. 2 other devices were signed out.")).toBeInTheDocument();
    expect(screen.getByLabelText('Current password')).toHaveValue('');
  });

  it('shows a wrong current password under its field', async () => {
    api.changePassword.mockRejectedValue(
      new ApiClientError('Your current password is not correct.', {
        code: 'VALIDATION_ERROR',
        status: 400,
        details: { fields: { currentPassword: ['Your current password is not correct.'] } },
      }),
    );
    renderPage();
    await fill('Wrong-pass-1!', 'New-pass-2!');
    expect(await screen.findByText('Your current password is not correct.')).toBeInTheDocument();
    expect(screen.queryByText('Could not change your password')).not.toBeInTheDocument();
  });

  it('toasts other errors', async () => {
    api.changePassword.mockRejectedValue(
      new ApiClientError('Too many requests', { code: 'RATE_LIMITED', status: 429 }),
    );
    renderPage();
    await fill('Old-pass-1!', 'New-pass-2!');
    expect(await screen.findByText('Could not change your password')).toBeInTheDocument();
    expect(screen.getByText('Too many requests')).toBeInTheDocument();
  });
});
