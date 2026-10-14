import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { io } from 'socket.io-client';
import { queryKeys } from '@/shared/api/query-keys';
import { useSessionStore } from '@/shared/store/session-store';
import { createTestQueryClient } from '@/test-utils/render-with-providers';
import { useMessagingSocket } from './use-messaging-socket';

type Handler = (payload?: unknown) => void;

type FakeSocket = {
  connected: boolean;
  on: jest.Mock<FakeSocket, [string, Handler]>;
  off: jest.Mock<FakeSocket, [string, Handler]>;
  removeAllListeners: jest.Mock;
  disconnect: jest.Mock;
  timeout: jest.Mock;
  receive: (event: string, payload?: unknown) => void;
};

function createFakeSocket(): FakeSocket {
  const handlers = new Map<string, Set<Handler>>();
  const socket: FakeSocket = {
    connected: false,
    on: jest.fn((event: string, handler: Handler) => {
      const set = handlers.get(event) ?? new Set<Handler>();
      set.add(handler);
      handlers.set(event, set);
      return socket;
    }),
    off: jest.fn((event: string, handler: Handler) => {
      handlers.get(event)?.delete(handler);
      return socket;
    }),
    removeAllListeners: jest.fn(() => handlers.clear()),
    disconnect: jest.fn(),
    timeout: jest.fn(() => ({ emit: jest.fn() })),
    /** Simulates an event pushed by the server. */
    receive(event: string, payload?: unknown) {
      handlers.get(event)?.forEach((handler) => handler(payload));
    },
  };
  return socket;
}

jest.mock('socket.io-client', () => ({ io: jest.fn() }));
jest.mock('@/shared/config/env', () => ({
  env: { apiUrl: 'https://api.example.com/api/v1', tenantSlug: null },
}));
jest.mock('@/shared/api/session', () => ({
  getAccessToken: jest.fn(async () => 'access-token'),
  refreshAccessToken: jest.fn(async () => 'access-token'),
}));

const ready = { userId: 'staff-1', tenantId: 'tenant-1', kind: 'staff' };

describe('useMessagingSocket', () => {
  let socket: FakeSocket;

  beforeEach(() => {
    socket = createFakeSocket();
    jest.mocked(io).mockReturnValue(socket as unknown as ReturnType<typeof io>);
    useSessionStore.setState({ refreshToken: 'refresh-token' });
  });

  afterEach(() => {
    useSessionStore.setState({ refreshToken: null });
  });

  function renderSocketHook() {
    const queryClient = createTestQueryClient();
    const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return { invalidate, ...renderHook(() => useMessagingSocket(), { wrapper }) };
  }

  it('connects with long-polling first so it works behind any proxy', async () => {
    const { unmount } = renderSocketHook();

    await waitFor(() =>
      expect(io).toHaveBeenCalledWith(
        'https://api.example.com/messaging',
        expect.objectContaining({ transports: ['polling', 'websocket'] }),
      ),
    );
    unmount();
    expect(socket.disconnect).toHaveBeenCalled();
  });

  it('refetches messages each time the socket (re)connects', async () => {
    const { result, invalidate, unmount } = renderSocketHook();
    await waitFor(() => expect(socket.on).toHaveBeenCalledWith('connection:ready', expect.any(Function)));
    expect(result.current.ready).toBe(false);

    act(() => socket.receive('connection:ready', ready));
    expect(result.current.ready).toBe(true);
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(invalidate).toHaveBeenCalledWith(
      { queryKey: queryKeys.messages.all },
      { cancelRefetch: false },
    );

    act(() => socket.receive('disconnect'));
    expect(result.current.ready).toBe(false);

    act(() => socket.receive('connection:ready', ready));
    expect(result.current.ready).toBe(true);
    expect(invalidate).toHaveBeenCalledTimes(2);
    unmount();
  });
});
