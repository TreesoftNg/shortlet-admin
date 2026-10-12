'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { queryKeys } from '@/shared/api/query-keys';
import { useSessionStore } from '@/shared/store/session-store';
import {
  markConversationRead,
  sendConversationMessage,
} from '../api/messages-service';
import { mapMessage } from '../lib/map-conversation';
import {
  applyMessageToConversationList,
  clearConversationUnread,
  mergeMessageIntoThread,
} from '../lib/messaging-cache';
import {
  disconnectMessagingSocket,
  getMessagingSocket,
  joinConversation,
  leaveConversation,
  markReadViaSocket,
  sendMessageViaSocket,
  typingStart,
  typingStop,
} from '../lib/messaging-socket';
import type { ApiMessage, ConversationListItem, ThreadMessage } from '../types';

function newClientMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

let socketSubscribers = 0;

function clearUnreadCache(
  queryClient: ReturnType<typeof useQueryClient>,
  conversationId: string,
) {
  queryClient.setQueryData<ConversationListItem[]>(
    queryKeys.messages.conversations(),
    (prev) => clearConversationUnread(prev, conversationId),
  );
}

export function useMessagingSocket(options: {
  conversationId?: string | null;
  enabled?: boolean;
} = {}) {
  const { conversationId = null, enabled = true } = options;
  const queryClient = useQueryClient();
  const signedIn = useSessionStore((s) => Boolean(s.refreshToken));
  const [ready, setReady] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const joinedId = useRef<string | null>(null);
  const conversationIdRef = useRef(conversationId);
  conversationIdRef.current = conversationId;
  const markReadInFlight = useRef<Set<string>>(new Set());

  const persistMarkRead = useCallback(async (id: string) => {
    if (markReadInFlight.current.has(id)) return;
    markReadInFlight.current.add(id);
    clearUnreadCache(queryClient, id);
    try {
      const socket = socketRef.current;
      if (socket?.connected) {
        try {
          await markReadViaSocket(socket, id);
          clearUnreadCache(queryClient, id);
          return;
        } catch {
          // Fall through to REST.
        }
      }
      const saved = await markConversationRead(id);
      queryClient.setQueryData<ConversationListItem[]>(
        queryKeys.messages.conversations(),
        (prev) =>
          (prev ?? []).map((c) =>
            c.id === saved.id ? { ...c, unread_count: saved.unread_count } : c,
          ),
      );
    } catch {
      // Keep optimistic clear; next list fetch reconciles.
    } finally {
      markReadInFlight.current.delete(id);
    }
  }, [queryClient]);

  const patchMessageCaches = useCallback(
    (message: ThreadMessage) => {
      const activeId = conversationIdRef.current;
      const isOwn = message.senderType === 'staff';
      const isActive = message.conversationId === activeId;

      queryClient.setQueryData<ThreadMessage[]>(
        queryKeys.messages.thread(message.conversationId),
        (prev) => mergeMessageIntoThread(prev, message),
      );
      queryClient.setQueryData<ConversationListItem[]>(
        queryKeys.messages.conversations(),
        (prev) =>
          applyMessageToConversationList(prev, message, {
            incrementUnread: !isOwn && !isActive,
            clearUnread: isActive && !isOwn,
          }),
      );

      // Guest message while staff is viewing — clear on the server too.
      if (!isOwn && isActive) {
        void persistMarkRead(message.conversationId);
      }
    },
    [persistMarkRead, queryClient],
  );

  useEffect(() => {
    if (!enabled || !signedIn) return;

    let cancelled = false;
    let detach: (() => void) | null = null;
    socketSubscribers += 1;

    void getMessagingSocket().then((socket) => {
      if (!socket || cancelled) return;
      socketRef.current = socket;

      const onReady = () => setReady(true);
      const onError = () => setReady(false);
      const onDisconnect = () => setReady(false);
      const onMessageNew = (raw: ApiMessage) => {
        patchMessageCaches(mapMessage(raw));
      };
      const onMessageRead = (payload: { conversationId: string }) => {
        clearUnreadCache(queryClient, payload.conversationId);
      };
      const onUnread = (payload: {
        forKind: string;
        conversationId: string;
        staffUnreadCount: number;
      }) => {
        if (payload.forKind !== 'staff') return;
        const viewing = payload.conversationId === conversationIdRef.current;
        if (viewing) {
          clearUnreadCache(queryClient, payload.conversationId);
          if (payload.staffUnreadCount > 0) {
            void persistMarkRead(payload.conversationId);
          }
          return;
        }
        queryClient.setQueryData<ConversationListItem[]>(
          queryKeys.messages.conversations(),
          (prev) =>
            (prev ?? []).map((c) =>
              c.id === payload.conversationId
                ? { ...c, unread_count: payload.staffUnreadCount }
                : c,
            ),
        );
      };
      const onTypingStart = (payload: {
        conversationId: string;
        kind: string;
      }) => {
        if (
          payload.conversationId === conversationIdRef.current &&
          payload.kind === 'customer'
        ) {
          setPeerTyping(true);
        }
      };
      const onTypingStop = (payload: { conversationId: string }) => {
        if (payload.conversationId === conversationIdRef.current) {
          setPeerTyping(false);
        }
      };

      socket.on('connection:ready', onReady);
      socket.on('connection:error', onError);
      socket.on('disconnect', onDisconnect);
      socket.on('message:new', onMessageNew);
      socket.on('message:read', onMessageRead);
      socket.on('unread:update', onUnread);
      socket.on('typing:start', onTypingStart);
      socket.on('typing:stop', onTypingStop);
      if (socket.connected) setReady(true);

      detach = () => {
        socket.off('connection:ready', onReady);
        socket.off('connection:error', onError);
        socket.off('disconnect', onDisconnect);
        socket.off('message:new', onMessageNew);
        socket.off('message:read', onMessageRead);
        socket.off('unread:update', onUnread);
        socket.off('typing:start', onTypingStart);
        socket.off('typing:stop', onTypingStop);
      };
    });

    return () => {
      cancelled = true;
      detach?.();
      socketRef.current = null;
      setReady(false);
      socketSubscribers = Math.max(0, socketSubscribers - 1);
      if (socketSubscribers === 0) {
        disconnectMessagingSocket();
      }
    };
  }, [enabled, patchMessageCaches, persistMarkRead, queryClient, signedIn]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !ready || !conversationId) return;
    let cancelled = false;
    const previous = joinedId.current;

    clearUnreadCache(queryClient, conversationId);
    void persistMarkRead(conversationId);

    void (async () => {
      try {
        if (previous && previous !== conversationId) {
          await leaveConversation(socket, previous);
        }
        await joinConversation(socket, conversationId);
        if (cancelled) return;
        joinedId.current = conversationId;
      } catch {
        // Thread still works over REST without the room join.
      }
    })();

    return () => {
      cancelled = true;
      setPeerTyping(false);
      if (typingTimer.current) {
        clearTimeout(typingTimer.current);
        typingTimer.current = null;
      }
      if (joinedId.current === conversationId) {
        void leaveConversation(socket, conversationId).catch(() => undefined);
        joinedId.current = null;
      }
    };
  }, [conversationId, persistMarkRead, queryClient, ready]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) throw new Error('No conversation selected');
      const trimmed = content.trim();
      if (!trimmed) throw new Error('Message is empty');

      const clientMessageId = newClientMessageId();
      const optimistic: ThreadMessage = {
        id: `temp-${clientMessageId}`,
        conversationId,
        senderUserId: '',
        senderType: 'staff',
        senderName: 'You',
        body: trimmed,
        clientMessageId,
        createdAt: new Date().toISOString(),
      };
      patchMessageCaches(optimistic);

      const socket = socketRef.current;
      try {
        if (socket?.connected) {
          const saved = await sendMessageViaSocket(socket, {
            conversationId,
            content: trimmed,
            clientMessageId,
          });
          patchMessageCaches(saved);
          return saved;
        }
      } catch {
        // Fall through to REST.
      }

      const saved = await sendConversationMessage(conversationId, {
        content: trimmed,
        clientMessageId,
      });
      patchMessageCaches(saved);
      return saved;
    },
    [conversationId, patchMessageCaches],
  );

  const notifyTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !conversationId) return;
    void typingStart(socket, conversationId).catch(() => undefined);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      void typingStop(socket, conversationId).catch(() => undefined);
    }, 2_500);
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !conversationId) return;
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
      typingTimer.current = null;
    }
    void typingStop(socket, conversationId).catch(() => undefined);
  }, [conversationId]);

  return {
    ready,
    peerTyping,
    sendMessage,
    notifyTyping,
    stopTyping,
    markRead: persistMarkRead,
  };
}
