'use client';

import { env } from '@/shared/config/env';
import { getAccessToken, refreshAccessToken } from '@/shared/api/session';
import { io, type Socket } from 'socket.io-client';
import type { ApiMessage } from '../types';
import { mapMessage } from './map-conversation';
import type { ThreadMessage } from '../types';

type EmitAck<T> = ({ ok: true } & T) | { ok?: false; message?: string; code?: string };

/**
 * Long-polling first, then upgrade to WebSocket when the network allows it
 * (the Socket.IO default). Starting with WebSocket only would never connect
 * behind a proxy that drops the Upgrade header: the client does not fall back.
 */
export const MESSAGING_TRANSPORTS = ['polling', 'websocket'];

let shared: Socket | null = null;
let sharedToken: string | null = null;
let refreshReconnectInFlight = false;

function apiOrigin(): string {
  // env.apiUrl is like http://localhost:4000/api/v1
  return env.apiUrl.replace(/\/api\/v1\/?$/, '');
}

async function resolveStaffAuth(): Promise<{ token: string; actor: 'staff' } | null> {
  const token = await getAccessToken();
  if (!token) return null;
  sharedToken = token;
  return { token, actor: 'staff' };
}

/**
 * Singleton staff messaging socket. Auth uses a fresh access token on every
 * connect/reconnect (via refresh when the current access token is near expiry).
 */
export async function getMessagingSocket(): Promise<Socket | null> {
  const auth = await resolveStaffAuth();
  if (!auth) {
    disconnectMessagingSocket();
    return null;
  }

  if (shared && sharedToken === auth.token) {
    return shared;
  }

  disconnectMessagingSocket();
  sharedToken = auth.token;
  shared = io(`${apiOrigin()}/messaging`, {
    autoConnect: true,
    transports: MESSAGING_TRANSPORTS,
    // Called again on reconnect so we don't reuse an expired access token.
    auth: (cb) => {
      void resolveStaffAuth().then((next) => {
        cb(next ?? { token: '', actor: 'staff' });
      });
    },
  });

  shared.on('connection:error', (payload: { code?: string }) => {
    if (payload?.code !== 'INVALID_TOKEN' || refreshReconnectInFlight) return;
    refreshReconnectInFlight = true;
    void refreshAccessToken()
      .then((token) => {
        if (!token || !shared) return;
        sharedToken = token;
        shared.auth = { token, actor: 'staff' };
        shared.connect();
      })
      .finally(() => {
        refreshReconnectInFlight = false;
      });
  });

  return shared;
}

export function disconnectMessagingSocket(): void {
  if (shared) {
    shared.removeAllListeners();
    shared.disconnect();
    shared = null;
    sharedToken = null;
  }
}

function emitWithAck<T>(socket: Socket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(12_000).emit(event, payload, (err: Error | null, response: EmitAck<T>) => {
      if (err) {
        reject(err);
        return;
      }
      if (!response || response.ok === false) {
        reject(new Error(response?.message ?? response?.code ?? 'Socket request failed'));
        return;
      }
      resolve(response as T);
    });
  });
}

export function joinConversation(socket: Socket, conversationId: string) {
  return emitWithAck<{ ok: true; conversationId: string }>(socket, 'conversation:join', {
    conversationId,
  });
}

export function leaveConversation(socket: Socket, conversationId: string) {
  return emitWithAck<{ ok: true; conversationId: string }>(socket, 'conversation:leave', {
    conversationId,
  });
}

export async function sendMessageViaSocket(
  socket: Socket,
  payload: { conversationId: string; content: string; clientMessageId?: string },
): Promise<ThreadMessage> {
  const result = await emitWithAck<{ ok: true; message: ApiMessage }>(
    socket,
    'message:send',
    payload,
  );
  return mapMessage(result.message);
}

export function markReadViaSocket(socket: Socket, conversationId: string) {
  return emitWithAck<{ ok: true }>(socket, 'message:read', { conversationId });
}

export function typingStart(socket: Socket, conversationId: string) {
  return emitWithAck<{ ok: true }>(socket, 'typing:start', { conversationId });
}

export function typingStop(socket: Socket, conversationId: string) {
  return emitWithAck<{ ok: true }>(socket, 'typing:stop', { conversationId });
}
