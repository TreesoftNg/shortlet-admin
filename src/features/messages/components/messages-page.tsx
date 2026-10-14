'use client';

import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { ConversationList } from '@/features/messages/components/conversation-list';
import { MessageThread } from '@/features/messages/components/message-thread';
import { useConversations } from '@/features/messages/hooks/use-messages';
import { useMessagingSocket } from '@/features/messages/hooks/use-messaging-socket';
import { findSurvivingConversation } from '@/features/messages/lib/messaging-cache';
import type { ConversationListItem } from '@/features/messages/types';
import {
  countMessageTabs,
  DEFAULT_MESSAGE_FILTERS,
  filterConversations,
  type MessageFilters,
  type MessageStatusTab,
} from '@/features/messages/utils/message-filters';
import {
  EmptyState,
  ErrorState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function MessagesPage() {
  const { data, isLoading, isError, error, refetch } = useConversations();
  const [filters, setFilters] = useState<MessageFilters>(DEFAULT_MESSAGE_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const { peerTyping, sendMessage, notifyTyping, stopTyping } =
    useMessagingSocket({
      conversationId: selectedId,
      enabled: true,
    });

  const conversations = useMemo(() => data ?? [], [data]);
  const tabCounts = useMemo(() => countMessageTabs(conversations), [conversations]);
  const filtered = useMemo(
    () => filterConversations(conversations, filters),
    [conversations, filters],
  );
  const selectedSnapshot = useRef<ConversationListItem | null>(null);

  const selected =
    conversations.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) selectedSnapshot.current = selected;
  }, [selected]);

  // Selected id vanished (e.g. duplicate merge) — jump to surviving same context.
  useEffect(() => {
    if (!selectedId) return;
    if (conversations.some((item) => item.id === selectedId)) return;
    const lost = selectedSnapshot.current;
    if (lost && lost.id === selectedId) {
      const survivor = findSurvivingConversation(conversations, lost);
      if (survivor) {
        setSelectedId(survivor.id);
        return;
      }
    }
    setSelectedId(null);
  }, [conversations, selectedId]);

  // Only pick an initial conversation. Do not jump away when marking read
  // removes the row from the Unread filter — that was re-selecting chats
  // and bringing unread badges back.
  useEffect(() => {
    if (selectedId) return;
    if (filtered.length === 0) return;
    setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const updateFilters = (next: Partial<MessageFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return <PageSkeleton variant="split" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load messages'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <Box>
        <PageHeader
          title="Messages"
          description="Guest conversations across direct and channel bookings."
          actions={
            <IconButton
              aria-label="Open navigation"
              icon={<LuMenu size={20} />}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              onClick={openMobileNav}
            />
          }
        />
        <EmptyState
          title="No conversations yet"
          description="When guests message you about bookings, threads will appear here."
        />
      </Box>
    );
  }

  return (
    <Flex
      direction="column"
      // Keep the split pane in the viewport so each column scrolls on its own.
      h={{ base: 'auto', xl: 'calc(100dvh - 80px)' }}
      minH={{ xl: '560px' }}
    >
      <Box flexShrink={0}>
        <PageHeader
          title="Messages"
          description="Guest conversations across direct and channel bookings."
          actions={
            <IconButton
              aria-label="Open navigation"
              icon={<LuMenu size={20} />}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              onClick={openMobileNav}
            />
          }
        />
      </Box>

      <Grid
        templateColumns={{ base: '1fr', xl: '360px minmax(0, 1fr)' }}
        gap="18px"
        alignItems="stretch"
        flex="1"
        minH={0}
      >
        <Panel
          p={0}
          overflow="hidden"
          minW={0}
          minH={0}
          h={{ base: 'auto', xl: '100%' }}
          maxH={{ base: '480px', xl: 'none' }}
          display="flex"
          flexDirection="column"
        >
          <Box px="16px" pt="16px" flexShrink={0}>
            <FilterTabs<MessageStatusTab>
              value={filters.tab}
              onChange={(tab) => updateFilters({ tab })}
              items={[
                { id: 'all', label: 'All', count: tabCounts.all },
                { id: 'unread', label: 'Unread', count: tabCounts.unread },
                { id: 'closed', label: 'Closed', count: tabCounts.closed },
              ]}
            />
            <InputGroup mb="12px">
              <InputLeftElement pointerEvents="none" h="40px" color="ink.300">
                <LuSearch size={16} />
              </InputLeftElement>
              <Input
                h="40px"
                pl="40px"
                bg="white"
                borderColor="line.500"
                borderRadius="12px"
                fontSize="14px"
                placeholder="Search guests, bookings…"
                value={filters.search}
                onChange={(event) =>
                  updateFilters({ search: event.target.value })
                }
              />
            </InputGroup>
          </Box>
          <Box flex="1" overflowY="auto" minH={0}>
            <ConversationList
              conversations={filtered}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </Box>
        </Panel>

        <Panel
          p={0}
          overflow="hidden"
          minW={0}
          minH={0}
          h={{ base: 'auto', xl: '100%' }}
          display={{ base: selected ? 'flex' : 'none', xl: 'flex' }}
          flexDirection="column"
        >
          <Box flex="1" minH={0} display="flex" flexDirection="column">
            <MessageThread
              conversation={selected}
              peerTyping={peerTyping}
              sendMessage={sendMessage}
              notifyTyping={notifyTyping}
              stopTyping={stopTyping}
            />
          </Box>
          {selected ? (
            <Box display={{ base: 'block', xl: 'none' }} px="18px" pb="14px">
              <Button
                variant="secondary"
                w="100%"
                onClick={() => setSelectedId(null)}
              >
                Back to conversations
              </Button>
            </Box>
          ) : null}
        </Panel>
      </Grid>
    </Flex>
  );
}
