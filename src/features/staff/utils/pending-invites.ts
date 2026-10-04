import type { StaffMember } from '@/shared/types/hospitable';

const PREFIX = 'sunmade-staff-invites:';

function storageKey(tenantId: string): string {
  return `${PREFIX}${tenantId}`;
}

function isStaffMember(value: unknown): value is StaffMember {
  if (!value || typeof value !== 'object') return false;
  const row = value as StaffMember;
  return (
    typeof row.id === 'string' &&
    typeof row.email === 'string' &&
    typeof row.role === 'string' &&
    row.status === 'invited'
  );
}

export function loadPendingInvites(tenantId: string | undefined): StaffMember[] {
  if (!tenantId || typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(storageKey(tenantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStaffMember);
  } catch {
    return [];
  }
}

export function savePendingInvites(
  tenantId: string,
  members: StaffMember[],
): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(storageKey(tenantId), JSON.stringify(members));
}
