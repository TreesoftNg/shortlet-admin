import { getStaffColumns } from './staff-table-config';

describe('getStaffColumns', () => {
  it('returns the expected staff list columns', () => {
    expect(getStaffColumns().map((column) => column.id)).toEqual([
      'member',
      'role',
      'activity',
      'status',
      'created',
      'updated',
    ]);
  });
});
