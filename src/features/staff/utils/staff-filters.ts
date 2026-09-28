import type { StatusTone } from '@/shared/components/ui';
import type { StaffMember, StaffRole, StaffStatus } from '@/shared/types/hospitable';

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
  { value: 'operations', label: 'Operations' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'viewer', label: 'Viewer' },
];

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
    .sort((a, b) => a.full_name.localeCompare(b.full_name));
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

export function getRolePermissions(role: StaffRole): string[] {
  switch (role) {
    case 'owner':
      return [
        'Full account access',
        'Manage billing',
        'Invite & remove staff',
        'All property & finance actions',
      ];
    case 'admin':
      return [
        'Manage properties & bookings',
        'Invite staff (non-owners)',
        'View reports & payments',
        'Moderate reviews & messages',
      ];
    case 'operations':
      return [
        'Manage availability & units',
        'Handle check-ins / check-outs',
        'Respond to guest messages',
        'View bookings',
      ];
    case 'finance':
      return [
        'View payments & refunds',
        'Approve refunds',
        'Export finance reports',
        'View booking financials',
      ];
    case 'support':
      return [
        'Respond to guest messages',
        'View bookings & customers',
        'Moderate reviews',
        'Create support notes',
      ];
    case 'viewer':
      return ['Read-only dashboard', 'View reports', 'View bookings'];
    default:
      return [];
  }
}
