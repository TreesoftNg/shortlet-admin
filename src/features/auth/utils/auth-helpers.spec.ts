import { ApiClientError } from '@/shared/api/types';
import type { AdminProfile } from '../types';
import { displayName, hasPermission, initials, loginErrorMessage, safeNextPath, tenantChoicesFrom } from './auth-helpers';

const profile: AdminProfile = {
  user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
  tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
  role: { code: 'owner', name: 'Owner' },
  permissions: ['integration.manage'],
};

describe('auth helpers', () => {
  it('checks permissions', () => {
    expect(hasPermission(profile, 'integration.manage')).toBe(true);
    expect(hasPermission(profile, 'staff.manage')).toBe(false);
    expect(hasPermission(undefined, 'integration.manage')).toBe(false);
  });

  it.each([
    ['/calendar-sync', '/calendar-sync'],
    ['/units?propertyId=2', '/units?propertyId=2'],
    [null, '/'],
    ['https://evil.example', '/'],
    ['//evil.example', '/'],
    ['/\\evil.example', '/'],
    ['/login?next=/x', '/'],
  ])('safeNextPath(%j) → %j', (next, expected) => {
    expect(safeNextPath(next)).toBe(expected);
  });

  it('explains login failures', () => {
    expect(loginErrorMessage(new ApiClientError('Email or password is incorrect', { code: 'INVALID_CREDENTIALS', status: 401 }))).toBe(
      'Email or password is incorrect',
    );
    expect(loginErrorMessage(new ApiClientError('x', { code: 'RATE_LIMITED', status: 429 }))).toMatch(/wait a minute/);
    expect(loginErrorMessage('boom')).toMatch(/Something went wrong/);
  });

  it('reads tenant choices from TENANT_REQUIRED', () => {
    const tenants = [{ slug: 'sunmade', name: 'Sunmade' }];
    expect(tenantChoicesFrom(new ApiClientError('x', { code: 'TENANT_REQUIRED', status: 400, details: { tenants } }))).toEqual(tenants);
    expect(tenantChoicesFrom(new ApiClientError('x', { code: 'FORBIDDEN', status: 403 }))).toEqual([]);
  });

  it('formats names', () => {
    expect(displayName(profile)).toBe('Ada Okafor');
    expect(initials(profile)).toBe('AO');
  });
});
