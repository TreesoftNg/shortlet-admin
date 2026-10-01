import { env } from '@/shared/config/env';
import { ApiClientError, type ApiErrorResponse, type ApiSuccessResponse } from './types';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type HttpRequest = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

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
    (payload as { success?: unknown }).success === true &&
    'data' in payload
  );
}

function isApiError(payload: unknown): payload is ApiErrorResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as { success?: unknown }).success === false &&
    'error' in payload
  );
}

/**
 * One HTTP call to the Shortlet API, without authentication. Expects the PRD
 * response envelope and throws ApiClientError for anything else.
 */
export async function sendRequest<T>(path: string, request: HttpRequest = {}): Promise<ApiSuccessResponse<T>> {
  const { method = 'GET', body, headers = {}, signal } = request;

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiClientError('Cannot reach the server. Check your connection and try again.', {
      code: 'NETWORK_ERROR',
      status: 0,
    });
  }

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
    throw new ApiClientError('Request failed', { code: 'INTERNAL_ERROR', status: response.status });
  }

  if (!isApiSuccess<T>(payload)) {
    throw new ApiClientError('Invalid API response shape', { code: 'INTERNAL_ERROR', status: response.status });
  }
  return payload;
}
