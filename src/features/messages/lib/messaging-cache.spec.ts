import {
  applyMessageToConversationList,
  clearConversationUnread,
  mergeMessageIntoThread,
} from './messaging-cache';
import type { ConversationListItem, ThreadMessage } from '../types';

const conversation = (overrides: Partial<ConversationListItem> = {}): ConversationListItem => ({
  id: 'conv-1',
  status: 'open',
  unread_count: 1,
  preview: 'Hi',
  last_message_at: '2026-10-12T10:00:00.000Z',
  guest: {
    id: 'c1',
    full_name: 'Ada',
    email: 'ada@example.com',
    picture_url: null,
  },
  reservation: null,
  propertyId: null,
  unitId: null,
  bookingId: null,
  ...overrides,
});

const message = (overrides: Partial<ThreadMessage> = {}): ThreadMessage => ({
  id: 'msg-1',
  conversationId: 'conv-1',
  senderUserId: 'u1',
  senderType: 'customer',
  senderName: 'Ada',
  body: 'Are you there?',
  clientMessageId: null,
  createdAt: '2026-10-12T12:00:00.000Z',
  ...overrides,
});

describe('messaging-cache', () => {
  it('merges optimistic messages by clientMessageId', () => {
    const optimistic = message({
      id: 'temp-1',
      clientMessageId: 'client-1',
      senderType: 'staff',
      body: 'On the way',
    });
    const saved = message({
      id: 'msg-real',
      clientMessageId: 'client-1',
      senderType: 'staff',
      body: 'On the way',
    });

    const merged = mergeMessageIntoThread([optimistic], saved);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe('msg-real');
  });

  it('bumps conversation preview and unread for guest messages', () => {
    const list = [conversation(), conversation({ id: 'conv-2', unread_count: 0 })];
    const next = applyMessageToConversationList(list, message(), {
      incrementUnread: true,
    });
    expect(next[0].id).toBe('conv-1');
    expect(next[0].preview).toBe('Are you there?');
    expect(next[0].unread_count).toBe(2);
  });

  it('clears unread when the open thread receives a guest message', () => {
    const list = [conversation({ unread_count: 4 })];
    const next = applyMessageToConversationList(list, message(), {
      incrementUnread: false,
      clearUnread: true,
    });
    expect(next[0].unread_count).toBe(0);
  });

  it('clears unread for a conversation', () => {
    const next = clearConversationUnread([conversation()], 'conv-1');
    expect(next[0].unread_count).toBe(0);
  });
});
