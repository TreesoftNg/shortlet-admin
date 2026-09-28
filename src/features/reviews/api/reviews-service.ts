import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { Review } from '@/shared/types/hospitable';

export async function fetchReviews() {
  if (isMockMode()) {
    return mockApi.getReviews();
  }

  return apiClient<Review[]>('/reviews');
}
