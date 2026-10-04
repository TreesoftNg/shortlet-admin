import type { AdminProfile } from '@/features/auth/types';
import { createEmptyStaffInviteForm } from './staff-invite-form';
import {
  mapInviteToStaffMember,
  mapProfileToStaffMember,
  mapStaffRole,
  mergeStaffDirectory,
  toInviteStaffPayload,
  upsertPendingInvite,
} from './staff-mappers';

const profile: AdminProfile = {
  user: {
    id: 'u1',
    email: 'ada@sunmadeapartments.com',
    firstName: 'Ada',
    lastName: 'Okafor',
  },
  tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
  role: { code: 'owner', name: 'Owner' },
  permissions: ['property.read', 'staff.manage'],
};

describe('staff mappers', () => {
  it('maps /auth/me into a staff row', () => {
    const member = mapProfileToStaffMember(profile);
    expect(member.id).toBe('u1');
    expect(member.email).toBe('ada@sunmadeapartments.com');
    expect(member.role).toBe('owner');
    expect(member.status).toBe('active');
    expect(member.is_you).toBe(true);
    expect(member.permissions).toEqual(['property.read', 'staff.manage']);
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

  it('merges you with pending invites and replaces the same email', () => {
    const you = mapProfileToStaffMember(profile);
    const first = mapInviteToStaffMember(
      {
        first_name: 'Funmi',
        last_name: 'Ade',
        email: 'funmi@sunmadeapartments.com',
        role: 'staff',
      },
      {
        email: 'funmi@sunmadeapartments.com',
        role: 'staff',
        expiresAt: '2026-10-11T00:00:00.000Z',
      },
    );
    const resent = { ...first, invite_expires_at: '2026-10-18T00:00:00.000Z' };
    const pending = upsertPendingInvite([first], resent);
    expect(pending).toHaveLength(1);
    expect(pending[0].invite_expires_at).toBe('2026-10-18T00:00:00.000Z');

    const directory = mergeStaffDirectory(you, [
      ...pending,
      { ...you, is_you: false, id: 'dup' },
    ]);
    expect(directory[0].is_you).toBe(true);
    expect(directory).toHaveLength(2);
  });

  it('falls back unknown roles to staff', () => {
    expect(mapStaffRole('operations')).toBe('staff');
    expect(mapStaffRole('admin')).toBe('admin');
  });
});
