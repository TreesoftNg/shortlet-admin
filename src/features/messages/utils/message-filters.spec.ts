import {
  countMessageTabs,
  DEFAULT_MESSAGE_FILTERS,
  filterConversations,
  formatMessageTime,
} from './message-filters';
import { mockConversations } from '@/mocks/data/messaging';

describe('message-filters', () => {
  it('counts unread and open tabs', () => {
    const counts = countMessageTabs(mockConversations);
    expect(counts.all).toBe(mockConversations.length);
    expect(counts.unread).toBeGreaterThan(0);
    expect(counts.open).toBeGreaterThan(0);
  });

  it('filters unread conversations', () => {
    const result = filterConversations(mockConversations, {
      ...DEFAULT_MESSAGE_FILTERS,
      tab: 'unread',
    });
    expect(result.every((item) => item.unread_count > 0)).toBe(true);
  });

  it('filters by guest search', () => {
    const result = filterConversations(mockConversations, {
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
