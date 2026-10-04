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
      role: 'admin',
    });
    expect(byRole.every((item) => item.role === 'admin')).toBe(true);
  });

  it('keeps the current user first', () => {
    const result = filterStaff(mockStaff, DEFAULT_STAFF_FILTERS);
    expect(result[0]?.is_you).toBe(true);
  });

  it('maps role and status labels', () => {
    expect(getStaffRoleLabel('manager')).toBe('Manager');
    expect(getStaffStatusDisplay('active')).toEqual({
      label: 'Active',
      tone: 'ok',
    });
    expect(getRolePermissions('staff').length).toBeGreaterThan(0);
  });
});
