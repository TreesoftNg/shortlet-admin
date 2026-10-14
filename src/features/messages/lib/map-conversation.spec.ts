import { mapConversation, mapMessage } from './map-conversation';
import type { ApiConversation, ApiMessage } from '../types';

describe('mapConversation', () => {
  it('maps API conversations into list items', () => {
    const api: ApiConversation = {
      id: 'conv-1',
      status: 'open',
      customer: {
        id: 'cust-1',
        firstName: 'Ada',
        lastName: 'Okafor',
        email: 'ada@example.com',
      },
      propertyId: 'prop-1',
      unitId: 'unit-1',
      bookingId: 'booking-1',
      propertyName: 'Azure Lekki',
      unitName: 'Studio A',
      contextLabel: 'Azure Lekki · Studio A',
      lastMessageAt: '2026-10-12T12:00:00.000Z',
      lastMessagePreview: 'Hello',
      lastMessageSenderType: 'customer',
      unreadCount: 3,
      closedAt: null,
      createdAt: '2026-10-12T10:00:00.000Z',
      updatedAt: '2026-10-12T12:00:00.000Z',
    };

    const mapped = mapConversation(api);
    expect(mapped.guest?.full_name).toBe('Ada Okafor');
    expect(mapped.unread_count).toBe(3);
    expect(mapped.preview).toBe('Hello');
    expect(mapped.contextLabel).toBe('Azure Lekki · Studio A');
    expect(mapped.reservation?.property?.name).toBe('Azure Lekki · Studio A');
  });
});

describe('mapMessage', () => {
  it('maps API messages into thread bubbles', () => {
    const api: ApiMessage = {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderUserId: 'user-1',
      senderType: 'staff',
      senderName: 'Kemi Adeyemi',
      content: 'On the way',
      clientMessageId: null,
      createdAt: '2026-10-12T12:01:00.000Z',
      updatedAt: '2026-10-12T12:01:00.000Z',
    };

    expect(mapMessage(api)).toMatchObject({
      body: 'On the way',
      senderType: 'staff',
      senderName: 'Kemi Adeyemi',
    });
  });
});
