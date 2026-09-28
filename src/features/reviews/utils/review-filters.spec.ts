import {
  countReviewTabs,
  DEFAULT_REVIEW_FILTERS,
  filterReviews,
  getModerationDisplay,
} from './review-filters';
import { mockReviews } from '@/mocks/data/reviews';

describe('review-filters', () => {
  it('counts moderation tabs', () => {
    const counts = countReviewTabs(mockReviews);
    expect(counts.all).toBe(mockReviews.length);
    expect(counts.pending).toBeGreaterThan(0);
    expect(counts.needs_response).toBeGreaterThan(0);
  });

  it('filters needs_response reviews', () => {
    const result = filterReviews(mockReviews, {
      ...DEFAULT_REVIEW_FILTERS,
      tab: 'needs_response',
    });
    expect(
      result.every((item) => item.can_respond && !item.public.response),
    ).toBe(true);
  });

  it('filters by search and rating', () => {
    const bySearch = filterReviews(mockReviews, {
      ...DEFAULT_REVIEW_FILTERS,
      search: 'penthouse',
    });
    expect(bySearch.length).toBeGreaterThan(0);

    const byRating = filterReviews(mockReviews, {
      ...DEFAULT_REVIEW_FILTERS,
      minRating: 5,
    });
    expect(byRating.every((item) => item.public.rating >= 5)).toBe(true);
  });

  it('maps moderation display', () => {
    expect(getModerationDisplay('published')).toEqual({
      label: 'Published',
      tone: 'ok',
    });
  });
});
