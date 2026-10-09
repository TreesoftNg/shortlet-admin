import { createEmptyStaffInviteForm } from './staff-invite-form';
import {
  mapInviteToStaffMember,
  mapStaffListItemToMember,
  mapStaffRole,
  toInviteStaffPayload,
} from './staff-mappers';
import type { StaffListItem } from '../types';

const listItem: StaffListItem = {
  id: 'mem-1',
  userId: 'u1',
  firstName: 'Ada',
  lastName: 'Okafor',
  fullName: 'Ada Okafor',
  email: 'ada@sunmadeapartments.com',
  phone: null,
  role: 'owner',
  roleName: 'Owner',
  status: 'active',
  avatarUrl: null,
  lastActiveAt: '2026-10-01T12:00:00.000Z',
  invitedAt: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2026-10-01T12:00:00.000Z',
};

describe('staff mappers', () => {
  it('maps GET /cc/staff rows into table members with is_you', () => {
    const member = mapStaffListItemToMember(listItem, 'u1');
    expect(member.id).toBe('mem-1');
    expect(member.first_name).toBe('Ada');
    expect(member.last_name).toBe('Okafor');
    expect(member.email).toBe('ada@sunmadeapartments.com');
    expect(member.role).toBe('owner');
    expect(member.status).toBe('active');
    expect(member.is_you).toBe(true);
    expect(member.permissions).toEqual([]);
    expect(member.invite_expires_at).toBeNull();
    expect(mapStaffListItemToMember(listItem, 'other').is_you).toBe(false);
  });

  it('builds invite payloads and pending rows', () => {
    const values = {
      ...createEmptyStaffInviteForm(),
      first_name: 'Funmi',
      last_name: 'Ade',
      email: 'funmi@sunmadeapartments.com',
      role: 'manager' as const,
    };
    expect(toInviteStaffPayload(values)).toEqual({
      email: 'funmi@sunmadeapartments.com',
      firstName: 'Funmi',
      lastName: 'Ade',
      role: 'manager',
    });

    const invite = mapInviteToStaffMember(values, {
      email: 'funmi@sunmadeapartments.com',
      role: 'manager',
      expiresAt: '2026-10-11T00:00:00.000Z',
    });
    expect(invite.status).toBe('invited');
    expect(invite.is_you).toBe(false);
    expect(invite.invite_expires_at).toBe('2026-10-11T00:00:00.000Z');
  });

  it('falls back unknown roles to staff', () => {
    expect(mapStaffRole('operations')).toBe('staff');
    expect(mapStaffRole('admin')).toBe('admin');
  });
});
