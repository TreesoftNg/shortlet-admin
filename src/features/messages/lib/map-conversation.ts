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
          property: api.propertyId ? { name: 'Linked stay' } : null,
        }
      : api.propertyId
        ? {
            platform_id: api.propertyId,
            property: { name: 'Property inquiry' },
          }
        : null,
    propertyId: api.propertyId,
    unitId: api.unitId,
    bookingId: api.bookingId,
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
