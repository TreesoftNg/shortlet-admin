import type { StatusTone } from '@/shared/components/ui';
import type { Review, ReviewStatus } from '../types';

export type ReviewStatusTab = 'all' | 'pending' | 'published' | 'hidden' | 'needs_response';

export type ReviewFilters = {
  tab: ReviewStatusTab;
  search: string;
  minRating: number | 'all';
};

export type ReviewTabCount = Record<ReviewStatusTab, number>;

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  tab: 'all',
  search: '',
  minRating: 'all',
};

export function needsResponse(review: Review): boolean {
  return review.canRespond && !review.adminResponse;
}

function matchesTab(review: Review, tab: ReviewStatusTab): boolean {
  if (tab === 'pending') return review.status === 'pending';
  if (tab === 'published') return review.status === 'published';
  if (tab === 'hidden') return review.status === 'hidden';
  if (tab === 'needs_response') return needsResponse(review);
  return true;
}

function matchesSearch(review: Review, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [review.guestFullName, review.guestEmail, review.unitName, review.comment]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesRating(review: Review, minRating: number | 'all'): boolean {
  if (minRating === 'all') return true;
  return review.rating >= minRating;
}

export function countReviewTabs(reviews: Review[]): ReviewTabCount {
  return {
    all: reviews.length,
    pending: reviews.filter((item) => item.status === 'pending').length,
    published: reviews.filter((item) => item.status === 'published').length,
    hidden: reviews.filter((item) => item.status === 'hidden').length,
    needs_response: reviews.filter(needsResponse).length,
  };
}

export function filterReviews(reviews: Review[], filters: ReviewFilters): Review[] {
  return reviews
    .filter(
      (review) =>
        matchesTab(review, filters.tab) &&
        matchesSearch(review, filters.search) &&
        matchesRating(review, filters.minRating),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getModerationDisplay(status: ReviewStatus): {
  label: string;
  tone: StatusTone;
} {
  switch (status) {
    case 'published':
      return { label: 'Published', tone: 'ok' };
    case 'pending':
      return { label: 'Pending', tone: 'warn' };
    case 'hidden':
      return { label: 'Hidden', tone: 'mute' };
    default:
      return { label: status, tone: 'mute' };
  }
}

export function formatReviewDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
