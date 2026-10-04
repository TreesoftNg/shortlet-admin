'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchReviews } from '../api/reviews-service';

export function useReviews({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.reviews.list(),
    queryFn: fetchReviews,
    enabled,
  });
}
