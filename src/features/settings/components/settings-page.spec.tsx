import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as settingsApi from '../api/settings-service';
import { settingsResponse } from '../test-fixtures';
import { SettingsPage } from './settings-page';

jest.mock('../api/settings-service');
const api = jest.mocked(settingsApi);

function renderAs(permissions = ['settings.manage']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<SettingsPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchSettings.mockResolvedValue(settingsResponse());
  api.updateSettings.mockResolvedValue(
    settingsResponse({
      settings: settingsResponse().settings.map((item) =>
        item.key === 'email.review_submitted' ? { ...item, value: true } : item,
      ),
      updatedAt: '2026-10-05T00:00:00Z',
    }),
  );
});

describe('SettingsPage', () => {
  it('lists email alert toggles from the API', async () => {
    renderAs();
    expect(await screen.findByText('New bookings')).toBeInTheDocument();
    expect(screen.getByText('Failed payments')).toBeInTheDocument();
    expect(screen.getByText('New reviews')).toBeInTheDocument();
    expect(screen.queryByText('Business')).not.toBeInTheDocument();
  });

  it('saves toggled values', async () => {
    renderAs();
    const switches = await screen.findAllByRole('checkbox');
    await userEvent.click(switches[2]);
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => {
      expect(api.updateSettings).toHaveBeenCalledWith({
        'email.booking_created': true,
        'email.payment_failed': true,
        'email.review_submitted': true,
      });
    });
    expect(await screen.findByText('Settings saved')).toBeInTheDocument();
  });

  it('hides save without settings.manage', async () => {
    renderAs([]);
    expect(await screen.findByText('New bookings')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });

  it('toasts API errors from save', async () => {
    api.updateSettings.mockRejectedValue(
      new ApiClientError('Could not save settings', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderAs();
    await screen.findByText('New bookings');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Could not save')).toBeInTheDocument();
    expect(screen.getByText('Could not save settings')).toBeInTheDocument();
  });
});
