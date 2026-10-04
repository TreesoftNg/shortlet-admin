import { env } from '@/shared/config/env';
import { getAccessToken, refreshAccessToken } from '@/shared/api/session';
import { ApiClientError, type ApiSuccessResponse } from '@/shared/api/types';

export type UploadProgressFn = (percent: number) => void;

type XhrOptions = {
  method?: 'POST' | 'PUT';
  url: string;
  body: XMLHttpRequestBodyInit;
  headers?: Record<string, string>;
  onProgress?: UploadProgressFn;
  signal?: AbortSignal;
};

function parseJsonSafe(text: string): unknown {
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

function isApiError(payload: unknown): payload is {
  success: false;
  error: { code: string; message: string; details?: Record<string, unknown> };
  meta?: { requestId?: string };
} {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as { success?: unknown }).success === false &&
    'error' in payload
  );
}

function xhrRequest(options: XhrOptions): Promise<{ status: number; text: string }> {
  const { method = 'POST', url, body, headers = {}, onProgress, signal } = options;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);

    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value);
    }

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
    xhr.onerror = () =>
      reject(
        new ApiClientError('Cannot reach the server. Check your connection and try again.', {
          code: 'NETWORK_ERROR',
          status: 0,
        }),
      );
    xhr.onabort = () => {
      const error = new DOMException('Aborted', 'AbortError');
      reject(error);
    };

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener('abort', () => xhr.abort(), { once: true });
    }

    xhr.send(body);
  });
}

function throwIfEnvelopeError(status: number, payload: unknown): void {
  if (status >= 200 && status < 300) return;
  if (isApiError(payload)) {
    throw new ApiClientError(payload.error.message, {
      code: payload.error.code,
      status,
      details: payload.error.details,
      requestId: payload.meta?.requestId,
    });
  }
  throw new ApiClientError('Request failed', { code: 'INTERNAL_ERROR', status });
}

function parseSuccess<T>(status: number, text: string): ApiSuccessResponse<T> {
  const payload = parseJsonSafe(text);
  throwIfEnvelopeError(status, payload);
  if (!isApiSuccess<T>(payload)) {
    throw new ApiClientError('Invalid API response shape', {
      code: 'INTERNAL_ERROR',
      status,
    });
  }
  return payload;
}

function tenantHeaders(): Record<string, string> {
  return env.tenantSlug ? { 'x-tenant-slug': env.tenantSlug } : {};
}

function authenticationRequired(): ApiClientError {
  return new ApiClientError('Please sign in to continue.', {
    code: 'AUTHENTICATION_REQUIRED',
    status: 401,
  });
}

/** Multipart/API XHR with Bearer auth, one 401 refresh, and upload progress. */
export async function uploadApiWithProgress<T>(
  path: string,
  body: FormData,
  options: { onProgress?: UploadProgressFn; signal?: AbortSignal } = {},
): Promise<ApiSuccessResponse<T>> {
  const url = `${env.apiUrl}${path}`;

  const send = async (token: string) =>
    xhrRequest({
      method: 'POST',
      url,
      body,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...tenantHeaders(),
      },
      onProgress: options.onProgress,
      signal: options.signal,
    });

  const token = await getAccessToken();
  if (!token) throw authenticationRequired();

  let result = await send(token);
  if (result.status === 401) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) throw authenticationRequired();
    result = await send(refreshed);
  }

  return parseSuccess<T>(result.status, result.text);
}

/** Direct storage PUT using only the ticket headers (no Authorization). */
export async function putToStorage(
  uploadUrl: string,
  file: File,
  headers: Record<string, string>,
  options: { onProgress?: UploadProgressFn; signal?: AbortSignal } = {},
): Promise<void> {
  const result = await xhrRequest({
    method: 'PUT',
    url: uploadUrl,
    body: file,
    headers,
    onProgress: options.onProgress,
    signal: options.signal,
  });
  if (result.status < 200 || result.status >= 300) {
    throw new ApiClientError('Could not upload the file to storage.', {
      code: 'INTERNAL_ERROR',
      status: result.status,
    });
  }
}
