import {
  countMessageTabs,
  DEFAULT_MESSAGE_FILTERS,
  filterConversations,
  formatMessageTime,
} from './message-filters';
import type { ConversationListItem } from '../types';

const sample: ConversationListItem[] = [
  {
    id: 'conv-1',
    status: 'open',
    unread_count: 2,
    preview: 'Are you there?',
    last_message_at: '2026-10-12T12:00:00.000Z',
    guest: {
      id: 'c1',
      full_name: 'Ada Okafor',
      email: 'ada@example.com',
      picture_url: null,
    },
    reservation: null,
    propertyId: null,
    unitId: null,
    bookingId: null,
    propertyName: null,
    unitName: null,
    contextLabel: null,
  },
  {
    id: 'conv-2',
    status: 'closed',
    unread_count: 0,
    preview: 'Thanks!',
    last_message_at: '2026-10-11T12:00:00.000Z',
    guest: {
      id: 'c2',
      full_name: 'Sarah Johnson',
      email: 'sarah@example.com',
      picture_url: null,
    },
    reservation: {
      platform_id: 'booking-1',
      property: { name: 'Lekki Suite' },
    },
    propertyId: 'p1',
    unitId: 'u1',
    bookingId: 'booking-1',
    propertyName: 'Lekki Suite',
    unitName: 'Unit 1',
    contextLabel: 'Lekki Suite · Unit 1',
  },
];

describe('message-filters', () => {
  it('counts unread and closed tabs', () => {
    const counts = countMessageTabs(sample);
    expect(counts.all).toBe(2);
    expect(counts.unread).toBe(1);
    expect(counts.closed).toBe(1);
  });

  it('filters unread conversations', () => {
    const result = filterConversations(sample, {
      ...DEFAULT_MESSAGE_FILTERS,
      tab: 'unread',
    });
    expect(result.every((item) => item.unread_count > 0)).toBe(true);
  });

  it('filters by guest search', () => {
    const result = filterConversations(sample, {
      ...DEFAULT_MESSAGE_FILTERS,
      search: 'sarah',
    });
    expect(result).toHaveLength(1);
    expect(result[0].guest?.full_name).toBe('Sarah Johnson');
  });

  it('formats message timestamps', () => {
    expect(formatMessageTime('2026-09-21T08:00:00Z')).toContain('Sep');
  });
});
