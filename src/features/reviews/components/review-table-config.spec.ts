import { getReviewColumns } from './review-table-config';

describe('getReviewColumns', () => {
  it('returns the expected review list columns', () => {
    expect(getReviewColumns().map((column) => column.id)).toEqual([
      'guest',
      'unit',
      'rating',
      'review',
      'date',
      'status',
    ]);
  });
});
