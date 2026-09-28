import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { ConversationListItem } from '@/mocks/data/messaging';
import type { Message } from '@/shared/types/hospitable';

export async function fetchConversations() {
  if (isMockMode()) {
    return mockApi.getConversations();
  }

  return apiClient<ConversationListItem[]>('/conversations');
}

export async function fetchConversationMessages(conversationId: string) {
  if (isMockMode()) {
    return mockApi.getConversationMessages(conversationId);
  }

  return apiClient<Message[]>(`/conversations/${conversationId}/messages`);
}
