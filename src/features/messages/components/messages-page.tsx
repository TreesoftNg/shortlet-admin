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
import { useEffect, useMemo, useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { ConversationList } from '@/features/messages/components/conversation-list';
import { MessageThread } from '@/features/messages/components/message-thread';
import { useConversations } from '@/features/messages/hooks/use-messages';
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

  const conversations = data ?? [];
  const tabCounts = useMemo(() => countMessageTabs(conversations), [conversations]);
  const filtered = useMemo(
    () => filterConversations(conversations, filters),
    [conversations, filters],
  );

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null);
      return;
    }
    const stillVisible = filtered.some((item) => item.id === selectedId);
    if (!stillVisible) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected =
    conversations.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

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

      <Grid
        templateColumns={{ base: '1fr', xl: '360px minmax(0, 1fr)' }}
        gap="18px"
        alignItems="stretch"
      >
        <Panel p={0} overflow="hidden" minW={0}>
          <Box px="16px" pt="16px">
            <FilterTabs<MessageStatusTab>
              value={filters.tab}
              onChange={(tab) => updateFilters({ tab })}
              items={[
                { id: 'all', label: 'All', count: tabCounts.all },
                { id: 'unread', label: 'Unread', count: tabCounts.unread },
                { id: 'open', label: 'Open', count: tabCounts.open },
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
          <ConversationList
            conversations={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </Panel>

        <Panel
          p={0}
          overflow="hidden"
          minW={0}
          display={{ base: selected ? 'block' : 'none', xl: 'block' }}
        >
          <MessageThread conversation={selected} />
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
    </Box>
  );
}
