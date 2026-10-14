import type { ConversationListItem, ThreadMessage } from '../types';

export function mergeMessageIntoThread(
  existing: ThreadMessage[] | undefined,
  incoming: ThreadMessage,
): ThreadMessage[] {
  const list = existing ? [...existing] : [];
  const byId = list.findIndex((m) => m.id === incoming.id);
  if (byId >= 0) {
    list[byId] = incoming;
    return list;
  }
  if (incoming.clientMessageId) {
    const byClient = list.findIndex(
      (m) => m.clientMessageId === incoming.clientMessageId,
    );
    if (byClient >= 0) {
      list[byClient] = incoming;
      return list;
    }
  }
  list.push(incoming);
  list.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() ||
      a.id.localeCompare(b.id),
  );
  return list;
}

export function applyMessageToConversationList(
  list: ConversationListItem[] | undefined,
  message: ThreadMessage,
  opts: { incrementUnread: boolean; clearUnread?: boolean },
): ConversationListItem[] {
  const rows = list ? [...list] : [];
  const index = rows.findIndex((c) => c.id === message.conversationId);
  if (index < 0) return rows;

  const current = rows[index]!;
  let unread_count = current.unread_count;
  if (opts.clearUnread) {
    unread_count = 0;
  } else if (opts.incrementUnread) {
    unread_count = current.unread_count + 1;
  }

  const updated: ConversationListItem = {
    ...current,
    last_message_at: message.createdAt,
    preview: message.body,
    unread_count,
  };
  rows.splice(index, 1);
  rows.unshift(updated);
  return rows;
}

export function clearConversationUnread(
  list: ConversationListItem[] | undefined,
  conversationId: string,
): ConversationListItem[] {
  if (!list) return [];
  return list.map((c) =>
    c.id === conversationId ? { ...c, unread_count: 0 } : c,
  );
}

/** After a merge deletes the selected id, pick the surviving same-context row. */
export function findSurvivingConversation(
  conversations: ConversationListItem[],
  lost: Pick<
    ConversationListItem,
    'id' | 'guest' | 'propertyId' | 'unitId' | 'bookingId'
  >,
): ConversationListItem | null {
  const sameContext = conversations.filter(
    (c) =>
      c.id !== lost.id &&
      c.guest?.id === lost.guest?.id &&
      c.propertyId === lost.propertyId &&
      c.unitId === lost.unitId &&
      c.bookingId === lost.bookingId,
  );
  if (sameContext.length === 0) return null;
  return sameContext.sort((a, b) =>
    b.last_message_at.localeCompare(a.last_message_at),
  )[0]!;
}
