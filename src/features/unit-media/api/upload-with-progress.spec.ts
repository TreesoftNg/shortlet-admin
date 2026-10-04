import { ApiClientError } from '@/shared/api/types';
import { getAccessToken, refreshAccessToken } from '@/shared/api/session';
import { putToStorage, uploadApiWithProgress } from './upload-with-progress';

jest.mock('@/shared/api/session', () => ({
  getAccessToken: jest.fn(),
  refreshAccessToken: jest.fn(),
}));

const getToken = jest.mocked(getAccessToken);
const refresh = jest.mocked(refreshAccessToken);

type ScriptedReply = {
  status: number;
  text?: string;
  progress?: Array<{ loaded: number; total: number }>;
};

class FakeXHR {
  static requests: FakeXHR[] = [];
  static replies: ScriptedReply[] = [];

  upload: { onprogress: ((event: ProgressEvent<EventTarget>) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  responseText = '';
  headers: Record<string, string> = {};
  method = '';
  url = '';
  body: XMLHttpRequestBodyInit | null = null;
  aborted = false;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  abort() {
    this.aborted = true;
    this.onabort?.();
  }

  send(body?: XMLHttpRequestBodyInit) {
    this.body = body ?? null;
    FakeXHR.requests.push(this);
    const reply = FakeXHR.replies.shift() ?? { status: 200, text: JSON.stringify({ success: true, data: {} }) };
    for (const tick of reply.progress ?? []) {
      this.upload.onprogress?.({
        lengthComputable: true,
        loaded: tick.loaded,
        total: tick.total,
      } as ProgressEvent);
    }
    this.status = reply.status;
    this.responseText = reply.text ?? '';
    if (!this.aborted) this.onload?.();
  }
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://api.test/api/v1';
  process.env.NEXT_PUBLIC_TENANT_SLUG = 'sunmade';
  global.XMLHttpRequest = FakeXHR as unknown as typeof XMLHttpRequest;
});

afterAll(() => {
  delete process.env.NEXT_PUBLIC_TENANT_SLUG;
});

beforeEach(() => {
  FakeXHR.requests = [];
  FakeXHR.replies = [];
  getToken.mockReset();
  refresh.mockReset();
  getToken.mockResolvedValue('access-1');
});

describe('uploadApiWithProgress', () => {
  it('reports progress, sends Authorization and tenant slug, and unwraps the envelope', async () => {
    FakeXHR.replies.push({
      status: 200,
      text: JSON.stringify({ success: true, data: { id: 'm1' } }),
      progress: [
        { loaded: 50, total: 100 },
        { loaded: 100, total: 100 },
      ],
    });
    const percents: number[] = [];
    const body = new FormData();
    const result = await uploadApiWithProgress('/cc/units/u1/media/photos', body, {
      onProgress: (percent) => percents.push(percent),
    });

    expect(result.data).toEqual({ id: 'm1' });
    expect(percents).toEqual([50, 100]);
    expect(FakeXHR.requests[0].url).toBe('http://api.test/api/v1/cc/units/u1/media/photos');
    expect(FakeXHR.requests[0].headers.Authorization).toBe('Bearer access-1');
    expect(FakeXHR.requests[0].headers['x-tenant-slug']).toBe('sunmade');
  });

  it('refreshes once on 401', async () => {
    FakeXHR.replies.push({
      status: 401,
      text: JSON.stringify({ success: false, error: { code: 'AUTHENTICATION_REQUIRED', message: 'expired' } }),
    });
    FakeXHR.replies.push({
      status: 200,
      text: JSON.stringify({ success: true, data: { id: 'm2' } }),
    });
    refresh.mockResolvedValue('access-2');

    await uploadApiWithProgress('/cc/units/u1/media/photos', new FormData());

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(FakeXHR.requests).toHaveLength(2);
    expect(FakeXHR.requests[1].headers.Authorization).toBe('Bearer access-2');
  });

  it('maps error envelopes to ApiClientError', async () => {
    FakeXHR.replies.push({
      status: 422,
      text: JSON.stringify({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Too large' },
      }),
    });

    await expect(uploadApiWithProgress('/cc/units/u1/media/photos', new FormData())).rejects.toMatchObject({
      name: ApiClientError.name,
      message: 'Too large',
      code: 'VALIDATION_ERROR',
      status: 422,
    });
  });

  it('aborts when the signal is aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      uploadApiWithProgress('/cc/units/u1/media/photos', new FormData(), { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(FakeXHR.requests).toHaveLength(0);
  });
});

describe('putToStorage', () => {
  it('PUTs with ticket headers only', async () => {
    FakeXHR.replies.push({ status: 200, text: '' });
    await putToStorage('https://storage.test/object', new File(['mp4'], 'clip.mp4'), {
      'Content-Type': 'video/mp4',
    });

    expect(FakeXHR.requests[0].method).toBe('PUT');
    expect(FakeXHR.requests[0].url).toBe('https://storage.test/object');
    expect(FakeXHR.requests[0].headers).toEqual({ 'Content-Type': 'video/mp4' });
    expect(FakeXHR.requests[0].headers.Authorization).toBeUndefined();
  });
});
