import { getPropertyColumns } from './property-table-config';

describe('getPropertyColumns', () => {
  it('returns the expected property list columns', () => {
    expect(getPropertyColumns().map((column) => column.id)).toEqual([
      'property',
      'type',
      'units',
      'capacity',
      'channels',
      'status',
      'created',
      'updated',
    ]);
  });
});
