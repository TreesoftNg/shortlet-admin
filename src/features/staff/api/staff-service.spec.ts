import { apiClient } from '@/shared/api/client';
import { fetchStaff, inviteStaff } from './staff-service';
import type { StaffListItem } from '../types';

jest.mock('@/shared/api/client', () => ({
  apiClient: jest.fn(),
}));

const client = jest.mocked(apiClient);

const row = (overrides: Partial<StaffListItem> = {}): StaffListItem => ({
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
});

describe('staff-service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('fetches all pages from GET /cc/staff', async () => {
    const page1 = Array.from({ length: 100 }, (_, index) =>
      row({ id: `a-${index}`, userId: `u-${index}`, email: `a${index}@example.com` }),
    );
    client
      .mockResolvedValueOnce({
        success: true,
        data: page1,
        meta: { page: 1, limit: 100, total: 101, totalPages: 2 },
      })
      .mockResolvedValueOnce({
        success: true,
        data: [row({ id: 'b', userId: 'u2', email: 'b@example.com' })],
        meta: { page: 2, limit: 100, total: 101, totalPages: 2 },
      });

    const result = await fetchStaff();
    expect(result).toHaveLength(101);
    expect(result.at(-1)?.id).toBe('b');
    expect(client).toHaveBeenNthCalledWith(1, expect.stringContaining('/staff?'));
    expect(client.mock.calls[0][0]).toContain('page=1');
    expect(client.mock.calls[1][0]).toContain('page=2');
  });

  it('posts invites to /cc/staff-invites', async () => {
    client.mockResolvedValue({
      success: true,
      data: {
        email: 'funmi@example.com',
        role: 'manager',
        expiresAt: '2026-10-11T00:00:00.000Z',
      },
    });

    const sent = await inviteStaff({
      email: 'funmi@example.com',
      firstName: 'Funmi',
      lastName: 'Ade',
      role: 'manager',
    });

    expect(sent.email).toBe('funmi@example.com');
    expect(client).toHaveBeenCalledWith(
      expect.stringContaining('/staff-invites'),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
