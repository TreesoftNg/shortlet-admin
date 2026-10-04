'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { hideReview, publishReview } from '../api/reviews-service';

function useInvalidateReviews() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
}

export function useHideReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (id: string) => hideReview(id),
    onSuccess: invalidate,
  });
}

export function usePublishReview() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (id: string) => publishReview(id),
    onSuccess: invalidate,
  });
}
