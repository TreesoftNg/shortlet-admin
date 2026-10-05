import type { StaffMember, StaffRole } from '@/shared/types/hospitable';
import type {
  InviteStaffPayload,
  SentStaffInvite,
  StaffListItem,
} from '../types';
import type { StaffInviteFormValues } from './staff-invite-form';

const STAFF_ROLES: StaffRole[] = ['owner', 'admin', 'manager', 'staff'];

export function mapStaffRole(value: string | null | undefined): StaffRole {
  const code = (value ?? '').trim().toLowerCase();
  return STAFF_ROLES.includes(code as StaffRole)
    ? (code as StaffRole)
    : 'staff';
}

/** Map GET /cc/staff row → table/drawer StaffMember. */
export function mapStaffListItemToMember(
  item: StaffListItem,
  currentUserId?: string,
): StaffMember {
  return {
    id: item.id,
    first_name: item.firstName,
    last_name: item.lastName,
    full_name: item.fullName,
    email: item.email,
    phone: item.phone,
    role: mapStaffRole(item.role),
    status: item.status,
    avatar_url: item.avatarUrl,
    last_active_at: item.lastActiveAt,
    invited_at: item.invitedAt,
    invite_expires_at: null,
    permissions: [],
    is_you: Boolean(currentUserId && item.userId === currentUserId),
    created_at: item.createdAt,
    updated_at: item.updatedAt,
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
