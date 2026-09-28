import { ApiClientError, type ApiResponse, type ApiSuccessResponse } from './types';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Skip Authorization header (login/register/public). */
  skipAuth?: boolean;
};

type TokenGetter = () => string | null;

let accessTokenGetter: TokenGetter = () => null;

/** Wire auth token from Zustand (or future auth module) without circular imports. */
export function setAccessTokenGetter(getter: TokenGetter): void {
  accessTokenGetter = getter;
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api/v1';
}

async function parseJsonSafe(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isApiSuccess<T>(payload: unknown): payload is ApiSuccessResponse<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    (payload as ApiResponse<T>).success === true &&
    'data' in payload
  );
}

function isApiError(payload: unknown): payload is { success: false; error: { code: string; message: string; details?: Record<string, unknown> }; meta?: { requestId?: string } } {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    (payload as { success: boolean }).success === false &&
    'error' in payload
  );
}

/**
 * Single entry point for all HTTP calls.
 * Expects the PRD success/error envelope. Throws ApiClientError on failure.
 */
export async function apiClient<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiSuccessResponse<T>> {
  const { method = 'GET', body, headers = {}, signal, skipAuth = false } = options;
  const token = skipAuth ? null : accessTokenGetter();

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = await parseJsonSafe(response);

  if (!response.ok) {
    if (isApiError(payload)) {
      throw new ApiClientError(payload.error.message, {
        code: payload.error.code,
        status: response.status,
        details: payload.error.details,
        requestId: payload.meta?.requestId,
      });
    }

    throw new ApiClientError('Request failed', {
      code: 'INTERNAL_ERROR',
      status: response.status,
    });
  }

  if (!isApiSuccess<T>(payload)) {
    throw new ApiClientError('Invalid API response shape', {
      code: 'INTERNAL_ERROR',
      status: response.status,
    });
  }

  return payload;
}
