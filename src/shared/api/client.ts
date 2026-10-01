import { sendRequest, type HttpRequest } from './http';
import { endSession, getAccessToken, refreshAccessToken } from './session';
import { ApiClientError, type ApiSuccessResponse } from './types';

export type { HttpMethod } from './http';

export type RequestOptions = HttpRequest & {
  /** Set false for endpoints that work without signing in (e.g. login). */
  auth?: boolean;
};

function authenticationRequired(): ApiClientError {
  return new ApiClientError('Please sign in to continue.', { code: 'AUTHENTICATION_REQUIRED', status: 401 });
}

/**
 * Single entry point for Shortlet API calls. Sends the access token and, if
 * the API rejects it, refreshes once and retries before signing the user out.
 */
export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<ApiSuccessResponse<T>> {
  const { auth = true, ...request } = options;
  if (!auth) {
    return sendRequest<T>(path, request);
  }

  // Null means signed out; the session layer has already announced it.
  const token = await getAccessToken();
  if (!token) {
    throw authenticationRequired();
  }

  try {
    return await sendRequest<T>(path, withBearer(request, token));
  } catch (error) {
    if (!(error instanceof ApiClientError) || error.status !== 401) throw error;
  }

  const refreshed = await refreshAccessToken();
  if (!refreshed) {
    throw authenticationRequired();
  }
  try {
    return await sendRequest<T>(path, withBearer(request, refreshed));
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) endSession();
    throw error;
  }
}

function withBearer(request: HttpRequest, token: string): HttpRequest {
  return { ...request, headers: { ...request.headers, Authorization: `Bearer ${token}` } };
}
