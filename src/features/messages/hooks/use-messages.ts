'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  closeConversation,
  fetchConversationMessages,
  fetchConversations,
  markConversationRead,
  reopenConversation,
} from '../api/messages-service';
import { clearConversationUnread } from '../lib/messaging-cache';
import type { ConversationListItem } from '../types';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: () => fetchConversations({ limit: 50 }),
    staleTime: 15_000,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.messages.thread(conversationId ?? 'none'),
    queryFn: () =>
      fetchConversationMessages(conversationId as string, { limit: 40 }),
    enabled: Boolean(conversationId),
    staleTime: 15_000,
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationRead,
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.conversations(),
      });
      queryClient.setQueryData<ConversationListItem[]>(
        queryKeys.messages.conversations(),
        (prev) => clearConversationUnread(prev, conversationId),
      );
    },
    onSuccess: (conversation) => {
      queryClient.setQueryData<ConversationListItem[]>(
        queryKeys.messages.conversations(),
        (prev) =>
          (prev ?? []).map((c) =>
            c.id === conversation.id
              ? { ...c, unread_count: conversation.unread_count }
              : c,
          ),
      );
    },
  });
}

export function useCloseConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeConversation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      });
    },
  });
}

export function useReopenConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reopenConversation,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.conversations(),
      });
    },
  });
}
