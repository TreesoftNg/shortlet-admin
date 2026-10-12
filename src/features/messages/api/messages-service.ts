import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import { mapConversation, mapMessage } from '../lib/map-conversation';
import type {
  ApiConversation,
  ApiMessage,
  ApiMessagePage,
  ConversationListItem,
  ThreadMessage,
  UnreadCount,
} from '../types';

/** GET /cc/conversations */
export async function fetchConversations(params: {
  search?: string;
  status?: string;
  limit?: number;
} = {}): Promise<ConversationListItem[]> {
  const qs = new URLSearchParams();
  if (params.search?.trim()) qs.set('search', params.search.trim());
  if (params.status) qs.set('status', params.status);
  if (params.limit != null) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const response = await apiClient<ApiConversation[]>(
    adminPath(`/conversations${suffix}`),
  );
  const rows = Array.isArray(response.data) ? response.data : [];
  return rows.map(mapConversation);
}

/** GET /cc/conversations/unread-count */
export async function fetchUnreadCount(): Promise<UnreadCount> {
  const response = await apiClient<UnreadCount>(
    adminPath('/conversations/unread-count'),
  );
  return response.data;
}

/** GET /cc/conversations/:id/messages */
export async function fetchConversationMessages(
  conversationId: string,
  params: { before?: string; limit?: number } = {},
): Promise<ThreadMessage[]> {
  const qs = new URLSearchParams();
  if (params.before) qs.set('before', params.before);
  if (params.limit != null) qs.set('limit', String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : '';
  const response = await apiClient<ApiMessagePage>(
    adminPath(`/conversations/${encodeURIComponent(conversationId)}/messages${suffix}`),
  );
  return (response.data.items ?? []).map(mapMessage);
}

/** POST /cc/conversations/:id/messages */
export async function sendConversationMessage(
  conversationId: string,
  input: { content: string; clientMessageId?: string },
): Promise<ThreadMessage> {
  const response = await apiClient<ApiMessage>(
    adminPath(`/conversations/${encodeURIComponent(conversationId)}/messages`),
    {
      method: 'POST',
      body: input,
    },
  );
  return mapMessage(response.data);
}

/** POST /cc/conversations/:id/read */
export async function markConversationRead(
  conversationId: string,
): Promise<ConversationListItem> {
  const response = await apiClient<ApiConversation>(
    adminPath(`/conversations/${encodeURIComponent(conversationId)}/read`),
    {
      method: 'POST',
      body: {},
    },
  );
  return mapConversation(response.data);
}

/** POST /cc/conversations/:id/close */
export async function closeConversation(
  conversationId: string,
): Promise<ConversationListItem> {
  const response = await apiClient<ApiConversation>(
    adminPath(`/conversations/${encodeURIComponent(conversationId)}/close`),
    {
      method: 'POST',
      body: {},
    },
  );
  return mapConversation(response.data);
}

/** POST /cc/conversations/:id/reopen */
export async function reopenConversation(
  conversationId: string,
): Promise<ConversationListItem> {
  const response = await apiClient<ApiConversation>(
    adminPath(`/conversations/${encodeURIComponent(conversationId)}/reopen`),
    {
      method: 'POST',
      body: {},
    },
  );
  return mapConversation(response.data);
}
