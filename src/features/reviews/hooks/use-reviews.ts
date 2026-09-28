'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchReviews } from '../api/reviews-service';

export function useReviews() {
  return useQuery({
    queryKey: queryKeys.reviews.list(),
    queryFn: fetchReviews,
    select: (response) => response.data,
  });
}
