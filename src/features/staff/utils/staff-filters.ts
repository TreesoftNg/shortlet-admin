import type { StatusTone } from '@/shared/components/ui';
import type {
  StaffMember,
  StaffRole,
  StaffStatus,
} from '@/shared/types/hospitable';
import type { AdminProfile } from '@/features/auth/types';

export type StaffStatusTab = 'all' | 'active' | 'invited' | 'suspended';

export type StaffFilters = {
  tab: StaffStatusTab;
  search: string;
  role: StaffRole | 'all';
};

export type StaffTabCount = Record<StaffStatusTab, number>;

export const DEFAULT_STAFF_FILTERS: StaffFilters = {
  tab: 'all',
  search: '',
  role: 'all',
};

export const STAFF_ROLE_OPTIONS: Array<{ value: StaffRole; label: string }> = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'staff', label: 'Staff' },
];

export const INVITE_ROLE_OPTIONS = STAFF_ROLE_OPTIONS;

function matchesTab(member: StaffMember, tab: StaffStatusTab): boolean {
  if (tab === 'active') return member.status === 'active';
  if (tab === 'invited') return member.status === 'invited';
  if (tab === 'suspended') return member.status === 'suspended';
  return true;
}

function matchesSearch(member: StaffMember, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    member.full_name,
    member.email,
    member.phone,
    member.role,
    member.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesRole(member: StaffMember, role: StaffRole | 'all'): boolean {
  if (role === 'all') return true;
  return member.role === role;
}

export function countStaffTabs(members: StaffMember[]): StaffTabCount {
  return {
    all: members.length,
    active: members.filter((item) => item.status === 'active').length,
    invited: members.filter((item) => item.status === 'invited').length,
    suspended: members.filter((item) => item.status === 'suspended').length,
  };
}

export function filterStaff(
  members: StaffMember[],
  filters: StaffFilters,
): StaffMember[] {
  return members
    .filter(
      (member) =>
        matchesTab(member, filters.tab) &&
        matchesSearch(member, filters.search) &&
        matchesRole(member, filters.role),
    )
    .sort((a, b) => {
      if (a.is_you !== b.is_you) return a.is_you ? -1 : 1;
      return a.full_name.localeCompare(b.full_name);
    });
}

export function getStaffRoleLabel(role: StaffRole): string {
  return STAFF_ROLE_OPTIONS.find((item) => item.value === role)?.label ?? role;
}

export function getStaffStatusDisplay(status: StaffStatus): {
  label: string;
  tone: StatusTone;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', tone: 'ok' };
    case 'invited':
      return { label: 'Invited', tone: 'warn' };
    case 'suspended':
      return { label: 'Suspended', tone: 'danger' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function formatStaffDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatStaffDateTime(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatPermissionCode(code: string): string {
  return code
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getRolePermissions(role: StaffRole): string[] {
  switch (role) {
    case 'owner':
      return [
        'Full account access',
        'Invite staff (owner only)',
        'All property, unit, and finance actions',
      ];
    case 'admin':
      return [
        'Manage properties, units, and bookings',
        'View reports and payments',
        'Moderate reviews and messages',
      ];
    case 'manager':
      return [
        'Manage availability and units',
        'Handle bookings and guest messages',
        'View reports',
      ];
    case 'staff':
      return [
        'Day-to-day operations',
        'View bookings and customers',
        'Respond to guest messages',
      ];
    default:
      return [];
  }
}

/** Docs: only an owner can call POST /cc/staff-invites. */
export function canInviteStaff(profile: AdminProfile | undefined): boolean {
  return profile?.role.code === 'owner';
}
