import {
  countReviewTabs,
  DEFAULT_REVIEW_FILTERS,
  filterReviews,
  getModerationDisplay,
} from './review-filters';
import { review } from '../test-fixtures';

const reviews = [
  review(),
  review({
    id: 'rev-2',
    unitName: 'Studio',
    comment: 'Fine',
    rating: 3,
    status: 'pending',
    canRespond: true,
    adminResponse: null,
  }),
  review({
    id: 'rev-3',
    status: 'hidden',
    canRespond: false,
    adminResponse: 'Thanks',
    respondedAt: '2026-10-03T10:00:00.000Z',
  }),
];

describe('review-filters', () => {
  it('counts moderation tabs', () => {
    const counts = countReviewTabs(reviews);
    expect(counts.all).toBe(3);
    expect(counts.pending).toBe(1);
    expect(counts.needs_response).toBe(2);
    expect(counts.hidden).toBe(1);
  });

  it('filters needs_response reviews', () => {
    const result = filterReviews(reviews, {
      ...DEFAULT_REVIEW_FILTERS,
      tab: 'needs_response',
    });
    expect(result.every((item) => item.canRespond && !item.adminResponse)).toBe(true);
  });

  it('filters by search and rating', () => {
    const bySearch = filterReviews(reviews, {
      ...DEFAULT_REVIEW_FILTERS,
      search: 'penthouse',
    });
    expect(bySearch.every((item) => item.unitName.toLowerCase().includes('penthouse'))).toBe(true);
    expect(bySearch.length).toBeGreaterThan(0);

    const byRating = filterReviews(reviews, {
      ...DEFAULT_REVIEW_FILTERS,
      minRating: 5,
    });
    expect(byRating.every((item) => item.rating >= 5)).toBe(true);
  });

  it('maps moderation display', () => {
    expect(getModerationDisplay('published')).toEqual({
      label: 'Published',
      tone: 'ok',
    });
  });
});
