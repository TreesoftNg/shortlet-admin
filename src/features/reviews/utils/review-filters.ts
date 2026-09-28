import type { Review } from '@/shared/types/hospitable';
import type { StatusTone } from '@/shared/components/ui';

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

function matchesTab(review: Review, tab: ReviewStatusTab): boolean {
  if (tab === 'pending') return review.moderation_status === 'pending';
  if (tab === 'published') return review.moderation_status === 'published';
  if (tab === 'hidden') return review.moderation_status === 'hidden';
  if (tab === 'needs_response') return review.can_respond && !review.public.response;
  return true;
}

function matchesSearch(review: Review, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    review.guest?.full_name,
    review.reservation?.property?.name,
    review.reservation?.platform_id,
    review.public.review,
    review.platform,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function matchesRating(review: Review, minRating: number | 'all'): boolean {
  if (minRating === 'all') return true;
  return review.public.rating >= minRating;
}

export function countReviewTabs(reviews: Review[]): ReviewTabCount {
  return {
    all: reviews.length,
    pending: reviews.filter((item) => item.moderation_status === 'pending').length,
    published: reviews.filter((item) => item.moderation_status === 'published').length,
    hidden: reviews.filter((item) => item.moderation_status === 'hidden').length,
    needs_response: reviews.filter(
      (item) => item.can_respond && !item.public.response,
    ).length,
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
    .sort((a, b) =>
      (b.reviewed_at ?? '').localeCompare(a.reviewed_at ?? ''),
    );
}

export function getModerationDisplay(status: Review['moderation_status']): {
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
