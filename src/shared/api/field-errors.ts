import { ApiClientError } from './types';

/** Field errors the API returned (VALIDATION_ERROR `details.fields`), first message each. */
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiClientError)) return {};
  const fields = (error.details?.fields ?? {}) as Record<string, string[]>;
  return Object.fromEntries(Object.entries(fields).map(([field, messages]) => [field, messages[0] ?? '']));
}
