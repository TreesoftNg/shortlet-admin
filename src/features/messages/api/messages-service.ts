import { mockApi } from '@/mocks/api';

// Local mock data until this feature is connected to the Shortlet API.

export function fetchConversations() {
  return mockApi.getConversations();
}

export function fetchConversationMessages(conversationId: string) {
  return mockApi.getConversationMessages(conversationId);
}
