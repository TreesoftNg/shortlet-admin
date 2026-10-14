import type {
  ApiConversation,
  ApiMessage,
  ConversationListItem,
  ThreadMessage,
} from '../types';

export function mapConversation(api: ApiConversation): ConversationListItem {
  const fullName =
    `${api.customer.firstName} ${api.customer.lastName}`.trim() ||
    api.customer.email;

  const unread =
    typeof api.unreadCount === 'number'
      ? api.unreadCount
      : typeof api.staffUnreadCount === 'number'
        ? api.staffUnreadCount
        : 0;

  const contextLabel = api.contextLabel ?? null;
  const propertyName = api.propertyName ?? null;
  const unitName = api.unitName ?? null;
  const stayLabel = contextLabel ?? propertyName ?? unitName;

  return {
    id: api.id,
    status: api.status,
    unread_count: unread,
    preview: api.lastMessagePreview ?? 'No messages yet',
    last_message_at: api.lastMessageAt ?? api.updatedAt,
    guest: {
      id: api.customer.id,
      full_name: fullName,
      email: api.customer.email,
      picture_url: null,
    },
    reservation: api.bookingId
      ? {
          platform_id: api.bookingId,
          property: stayLabel ? { name: stayLabel } : null,
        }
      : stayLabel
        ? {
            platform_id: api.propertyId ?? api.unitId ?? api.id,
            property: { name: stayLabel },
          }
        : null,
    propertyId: api.propertyId,
    unitId: api.unitId,
    bookingId: api.bookingId,
    propertyName,
    unitName,
    contextLabel,
  };
}

export function mapMessage(api: ApiMessage): ThreadMessage {
  return {
    id: api.id,
    conversationId: api.conversationId,
    senderUserId: api.senderUserId,
    senderType: api.senderType,
    senderName: api.senderName,
    body: api.content,
    clientMessageId: api.clientMessageId,
    createdAt: api.createdAt,
  };
}
