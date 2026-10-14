/** UI models for admin messaging (mapped from Shortlet API). */

export type ConversationStatus = 'open' | 'closed';

export type MessageSenderType = 'customer' | 'staff';

export type ConversationGuest = {
  id: string;
  full_name: string;
  email: string;
  picture_url: string | null;
};

export type ConversationListItem = {
  id: string;
  status: ConversationStatus;
  unread_count: number;
  preview: string;
  last_message_at: string;
  guest: ConversationGuest | null;
  reservation: {
    platform_id: string;
    property: { name: string } | null;
  } | null;
  propertyId: string | null;
  unitId: string | null;
  bookingId: string | null;
  propertyName: string | null;
  unitName: string | null;
  contextLabel: string | null;
};

export type ThreadMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderType: MessageSenderType;
  senderName: string | null;
  body: string;
  clientMessageId: string | null;
  createdAt: string;
};

export type UnreadCount = {
  unreadConversations: number;
  unreadMessages: number;
};

/** Raw API shapes (snake avoided — API uses camelCase). */
export type ApiConversation = {
  id: string;
  status: ConversationStatus;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  propertyId: string | null;
  unitId: string | null;
  bookingId: string | null;
  propertyName?: string | null;
  unitName?: string | null;
  contextLabel?: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderType: MessageSenderType | null;
  unreadCount: number;
  /** Present on detail / mark-read responses. */
  staffUnreadCount?: number;
  customerUnreadCount?: number;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiMessage = {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderType: MessageSenderType;
  senderName: string | null;
  content: string;
  clientMessageId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiMessagePage = {
  items: ApiMessage[];
  nextBefore: string | null;
  hasMore: boolean;
};
