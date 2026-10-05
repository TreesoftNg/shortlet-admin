import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import {
  createTestQueryClient,
  renderWithProviders,
} from '@/test-utils/render-with-providers';
import * as staffApi from '../api/staff-service';
import type { StaffListItem } from '../types';
import { StaffPage } from './staff-page';

jest.mock('../api/staff-service');
const api = jest.mocked(staffApi);

function listItem(overrides: Partial<StaffListItem> = {}): StaffListItem {
  return {
    id: 'mem-1',
    userId: 'u1',
    firstName: 'Ada',
    lastName: 'Okafor',
    fullName: 'Ada Okafor',
    email: 'ada@example.com',
    phone: null,
    role: 'owner',
    roleName: 'Owner',
    status: 'active',
    avatarUrl: null,
    lastActiveAt: null,
    invitedAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function renderAs(permissions = ['staff.read'], roleCode = 'owner') {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: {
      id: 'u1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Okafor',
    },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: roleCode, name: roleCode },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return { ...renderWithProviders(<StaffPage />, queryClient), queryClient };
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchStaff.mockResolvedValue([
    listItem(),
    listItem({
      id: 'mem-2',
      userId: 'u2',
      firstName: 'Tunde',
      lastName: 'Bakare',
      fullName: 'Tunde Bakare',
      email: 'tunde@example.com',
      role: 'manager',
      roleName: 'Manager',
    }),
  ]);
  api.inviteStaff.mockResolvedValue({
    email: 'funmi@example.com',
    role: 'staff',
    expiresAt: '2026-10-11T00:00:00.000Z',
  });
});

describe('StaffPage', () => {
  it('lists staff from the API and marks you', async () => {
    renderAs();
    expect(await screen.findByText('Ada Okafor')).toBeInTheDocument();
    expect(screen.getByText('Tunde Bakare')).toBeInTheDocument();
    expect(screen.getByText(/You/i)).toBeInTheDocument();
    expect(api.fetchStaff).toHaveBeenCalled();
  });

  it('hides the list without staff.read', async () => {
    renderAs([]);
    expect(await screen.findByText('No access')).toBeInTheDocument();
    expect(api.fetchStaff).not.toHaveBeenCalled();
  });

  it('shows an API error', async () => {
    api.fetchStaff.mockRejectedValue(
      new ApiClientError('Staff unavailable', {
        code: 'INTERNAL_ERROR',
        status: 500,
      }),
    );
    renderAs();
    expect(await screen.findByText('Staff unavailable')).toBeInTheDocument();
  });

  it('invalidates the staff list after invite', async () => {
    const { queryClient } = renderAs();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    await userEvent.click(
      await screen.findByRole('button', { name: /Invite member/i }),
    );
    await userEvent.type(screen.getByLabelText(/First name/i), 'Funmi');
    await userEvent.type(screen.getByLabelText(/Last name/i), 'Ade');
    await userEvent.type(
      screen.getByLabelText(/Email/i),
      'funmi@example.com',
    );
    await userEvent.click(screen.getByRole('button', { name: /Send invite/i }));

    await waitFor(() => {
      expect(api.inviteStaff).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: queryKeys.staff.all,
      });
    });
  });
});
