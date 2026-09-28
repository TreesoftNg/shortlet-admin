'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import {
  fetchConversationMessages,
  fetchConversations,
} from '../api/messages-service';

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.messages.conversations(),
    queryFn: fetchConversations,
    select: (response) => response.data,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: queryKeys.messages.thread(conversationId ?? 'none'),
    queryFn: () => fetchConversationMessages(conversationId as string),
    enabled: Boolean(conversationId),
    select: (response) => response.data,
  });
}
