import type { ConversationListItem } from '@/mocks/data/messaging';

export type MessageStatusTab = 'all' | 'unread' | 'open' | 'closed';

export type MessageFilters = {
  tab: MessageStatusTab;
  search: string;
};

export type MessageTabCount = Record<MessageStatusTab, number>;

export const DEFAULT_MESSAGE_FILTERS: MessageFilters = {
  tab: 'all',
  search: '',
};

function matchesTab(
  conversation: ConversationListItem,
  tab: MessageStatusTab,
): boolean {
  if (tab === 'unread') return conversation.unread_count > 0;
  if (tab === 'open') return conversation.status === 'open';
  if (tab === 'closed') return conversation.status === 'closed';
  return true;
}

function matchesSearch(
  conversation: ConversationListItem,
  search: string,
): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const haystack = [
    conversation.guest?.full_name,
    conversation.guest?.email,
    conversation.reservation?.platform_id,
    conversation.reservation?.property?.name,
    conversation.preview,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export function countMessageTabs(
  conversations: ConversationListItem[],
): MessageTabCount {
  return {
    all: conversations.length,
    unread: conversations.filter((item) => item.unread_count > 0).length,
    open: conversations.filter((item) => item.status === 'open').length,
    closed: conversations.filter((item) => item.status === 'closed').length,
  };
}

export function filterConversations(
  conversations: ConversationListItem[],
  filters: MessageFilters,
): ConversationListItem[] {
  return conversations
    .filter(
      (conversation) =>
        matchesTab(conversation, filters.tab) &&
        matchesSearch(conversation, filters.search),
    )
    .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
}

export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}
