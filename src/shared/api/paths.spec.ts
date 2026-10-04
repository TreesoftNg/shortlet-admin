import { adminPath } from '@/shared/api/paths';

describe('adminPath', () => {
  it('prefixes command-center routes with /cc', () => {
    expect(adminPath('/auth/me')).toBe('/cc/auth/me');
    expect(adminPath('units')).toBe('/cc/units');
  });
});
