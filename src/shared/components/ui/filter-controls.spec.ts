import { buildPageNumbers } from './filter-controls';

describe('buildPageNumbers', () => {
  it('returns a short contiguous range', () => {
    expect(buildPageNumbers(1, 3)).toEqual([1, 2, 3]);
  });

  it('ellipsizes middle pages', () => {
    expect(buildPageNumbers(5, 18)).toEqual([1, '…', 5, '…', 18]);
  });
});
