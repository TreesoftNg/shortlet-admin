import type { ApiSuccessResponse } from '@/shared/api/types';

/** Simulate network latency for mock services. */
export function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function ok<T>(
  data: T,
  message = 'Operation completed successfully',
  meta?: ApiSuccessResponse<T>['meta'],
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    meta,
  };
}
