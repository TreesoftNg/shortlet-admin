import {
  countStaffTabs,
  DEFAULT_STAFF_FILTERS,
  filterStaff,
  getRolePermissions,
  getStaffRoleLabel,
  getStaffStatusDisplay,
} from './staff-filters';
import { mockStaff } from '@/mocks/data/staff';

describe('staff-filters', () => {
  it('counts status tabs', () => {
    const counts = countStaffTabs(mockStaff);
    expect(counts.all).toBe(mockStaff.length);
    expect(counts.active).toBeGreaterThan(0);
    expect(counts.invited).toBeGreaterThan(0);
    expect(counts.suspended).toBeGreaterThan(0);
  });

  it('filters invited tab', () => {
    const result = filterStaff(mockStaff, {
      ...DEFAULT_STAFF_FILTERS,
      tab: 'invited',
    });
    expect(result.every((item) => item.status === 'invited')).toBe(true);
  });

  it('filters by search and role', () => {
    const bySearch = filterStaff(mockStaff, {
      ...DEFAULT_STAFF_FILTERS,
      search: 'kemi',
    });
    expect(bySearch.length).toBeGreaterThan(0);

    const byRole = filterStaff(mockStaff, {
      ...DEFAULT_STAFF_FILTERS,
      role: 'finance',
    });
    expect(byRole.every((item) => item.role === 'finance')).toBe(true);
  });

  it('maps role and status labels', () => {
    expect(getStaffRoleLabel('operations')).toBe('Operations');
    expect(getStaffStatusDisplay('active')).toEqual({
      label: 'Active',
      tone: 'ok',
    });
    expect(getRolePermissions('viewer').length).toBeGreaterThan(0);
  });
});
