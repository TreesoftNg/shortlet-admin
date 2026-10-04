import type { AdminProfile } from '@/features/auth/types';
import type { StaffMember, StaffRole } from '@/shared/types/hospitable';
import type { InviteStaffPayload, SentStaffInvite } from '../types';
import type { StaffInviteFormValues } from './staff-invite-form';

const STAFF_ROLES: StaffRole[] = ['owner', 'admin', 'manager', 'staff'];

export function mapStaffRole(value: string | null | undefined): StaffRole {
  const code = (value ?? '').trim().toLowerCase();
  return STAFF_ROLES.includes(code as StaffRole)
    ? (code as StaffRole)
    : 'staff';
}

export function mapProfileToStaffMember(profile: AdminProfile): StaffMember {
  const now = new Date().toISOString();
  return {
    id: profile.user.id,
    first_name: profile.user.firstName,
    last_name: profile.user.lastName,
    full_name: `${profile.user.firstName} ${profile.user.lastName}`.trim(),
    email: profile.user.email,
    phone: null,
    role: mapStaffRole(profile.role.code),
    status: 'active',
    avatar_url: null,
    last_active_at: now,
    invited_at: null,
    invite_expires_at: null,
    permissions: [...profile.permissions],
    is_you: true,
    created_at: now,
    updated_at: now,
  };
}

export function mapInviteToStaffMember(
  values: StaffInviteFormValues,
  sent: SentStaffInvite,
  invitedAt = new Date().toISOString(),
): StaffMember {
  const role = mapStaffRole(sent.role || values.role);
  const email = sent.email.trim() || values.email.trim();
  return {
    id: inviteStaffId(email),
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    full_name: `${values.first_name.trim()} ${values.last_name.trim()}`.trim(),
    email,
    phone: null,
    role,
    status: 'invited',
    avatar_url: null,
    last_active_at: null,
    invited_at: invitedAt,
    invite_expires_at: sent.expiresAt,
    permissions: [],
    is_you: false,
    created_at: invitedAt,
    updated_at: invitedAt,
  };
}

export function inviteStaffId(email: string): string {
  return `invite:${email.trim().toLowerCase()}`;
}

export function toInviteStaffPayload(
  values: StaffInviteFormValues,
): InviteStaffPayload {
  return {
    email: values.email.trim(),
    firstName: values.first_name.trim(),
    lastName: values.last_name.trim(),
    role: values.role,
  };
}

export function mergeStaffDirectory(
  current: StaffMember,
  pending: StaffMember[],
): StaffMember[] {
  const youEmail = current.email.trim().toLowerCase();
  const others = pending.filter(
    (member) => member.email.trim().toLowerCase() !== youEmail,
  );
  return [current, ...others];
}

export function upsertPendingInvite(
  pending: StaffMember[],
  invite: StaffMember,
): StaffMember[] {
  const key = invite.email.trim().toLowerCase();
  const without = pending.filter(
    (member) => member.email.trim().toLowerCase() !== key,
  );
  return [invite, ...without];
}
