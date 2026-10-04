import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { Review } from '../types';

async function fetchAllReviews(): Promise<Review[]> {
  const limit = 100;
  let page = 1;
  const all: Review[] = [];

  for (;;) {
    const response = await apiClient<Review[]>(adminPath(`/reviews?page=${page}&limit=${limit}`));
    all.push(...response.data);
    const totalPages = response.meta?.totalPages;
    if (!totalPages || page >= totalPages || response.data.length < limit) {
      break;
    }
    page += 1;
  }

  return all;
}

/** GET /cc/reviews — all reviews for the tenant. */
export async function fetchReviews(): Promise<Review[]> {
  return fetchAllReviews();
}

/** PATCH /cc/reviews/:id/hide */
export async function hideReview(id: string): Promise<Review> {
  return (
    await apiClient<Review>(adminPath(`/reviews/${encodeURIComponent(id)}/hide`), {
      method: 'PATCH',
    })
  ).data;
}

/** PATCH /cc/reviews/:id/publish */
export async function publishReview(id: string): Promise<Review> {
  return (
    await apiClient<Review>(adminPath(`/reviews/${encodeURIComponent(id)}/publish`), {
      method: 'PATCH',
    })
  ).data;
}
