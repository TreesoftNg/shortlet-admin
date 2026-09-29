import { getUnitColumns } from './unit-table-config';

describe('getUnitColumns', () => {
  it('returns the expected unit list columns', () => {
    expect(getUnitColumns().map((column) => column.id)).toEqual([
      'unit',
      'property',
      'capacity',
      'rate',
      'status',
    ]);
  });
});
