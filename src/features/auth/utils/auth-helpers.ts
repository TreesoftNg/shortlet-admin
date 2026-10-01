import { ApiClientError } from '@/shared/api/types';
import type { AdminProfile, PermissionCode, TenantChoice } from '../types';

export function hasPermission(profile: AdminProfile | undefined, permission: PermissionCode): boolean {
  return Boolean(profile?.permissions.includes(permission));
}

/**
 * Where to go after signing in. Only same-site paths are allowed, so a
 * crafted `?next=` link cannot send the admin to another website.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  if (next === '/login' || next.startsWith('/login?')) return '/';
  return next;
}

/** Message to show for a failed sign-in. */
export function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === 'RATE_LIMITED') return 'Too many attempts. Please wait a minute and try again.';
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

/** Businesses to choose from when the API answers TENANT_REQUIRED. */
export function tenantChoicesFrom(error: unknown): TenantChoice[] {
  if (!(error instanceof ApiClientError) || error.code !== 'TENANT_REQUIRED') return [];
  const tenants = error.details?.tenants;
  return Array.isArray(tenants) ? (tenants as TenantChoice[]) : [];
}

export function displayName(profile: AdminProfile): string {
  return `${profile.user.firstName} ${profile.user.lastName}`.trim();
}

export function initials(profile: AdminProfile): string {
  return [profile.user.firstName, profile.user.lastName]
    .map((part) => part.trim().charAt(0).toUpperCase())
    .join('');
}
