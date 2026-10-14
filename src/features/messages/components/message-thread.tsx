'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { LuSend } from 'react-icons/lu';
import { EmptyState, ErrorState, StatusBadge } from '@/shared/components/ui';
import {
  useConversationMessages,
  useReopenConversation,
} from '../hooks/use-messages';
import type { ConversationListItem, ThreadMessage } from '../types';
import { formatMessageTime } from '../utils/message-filters';

type MessageThreadProps = {
  conversation: ConversationListItem | null;
  peerTyping?: boolean;
  sendMessage: (content: string) => Promise<unknown>;
  notifyTyping: () => void;
  stopTyping: () => void;
};

export function MessageThread({
  conversation,
  peerTyping = false,
  sendMessage,
  notifyTyping,
  stopTyping,
}: MessageThreadProps) {
  const conversationId = conversation?.id ?? null;
  const { data, isLoading, isError, error, refetch } =
    useConversationMessages(conversationId);
  const reopen = useReopenConversation();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const messages = data ?? [];
  const closed = conversation?.status === 'closed';

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    // Scroll only the thread pane — never the page (that was dragging the list).
    scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
  }, [messages.length, peerTyping]);

  useEffect(() => {
    setDraft('');
    setSendError(null);
  }, [conversationId]);

  async function handleSend() {
    if (!conversation || conversation.status === 'closed') return;
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setSendError(null);
    setDraft('');
    stopTyping();
    try {
      await sendMessage(content);
    } catch (err) {
      setDraft(content);
      setSendError(
        err instanceof Error ? err.message : 'Could not send message.',
      );
    } finally {
      setSending(false);
    }
  }

  if (!conversation) {
    return (
      <EmptyState
        title="Select a conversation"
        description="Choose a thread from the list to read and reply to messages."
        minH="420px"
      />
    );
  }

  return (
    <Flex direction="column" h="100%" minH={{ base: '420px', xl: 0 }}>
      <Flex
        px="18px"
        py="14px"
        borderBottom="1px solid"
        borderColor="line.500"
        align="center"
        gap="12px"
        flexShrink={0}
      >
        <Avatar
          size="sm"
          name={conversation.guest?.full_name ?? undefined}
          src={conversation.guest?.picture_url ?? undefined}
        />
        <Box minW={0} flex="1">
          <Heading as="h3" fontSize="16px" fontWeight={700} noOfLines={1}>
            {conversation.guest?.full_name ?? 'Guest'}
          </Heading>
          <Text color="ink.300" fontSize="12px" noOfLines={1}>
            {conversation.contextLabel ??
              conversation.guest?.email ??
              conversation.reservation?.property?.name ??
              'Guest inquiry'}
          </Text>
        </Box>
        <StatusBadge tone={closed ? 'mute' : 'ok'}>
          {closed ? 'Closed' : 'Open'}
        </StatusBadge>
      </Flex>

      <Box
        ref={scrollerRef}
        flex="1"
        overflowY="auto"
        minH={0}
        px="18px"
        py="16px"
        bg="bg.400"
      >
        {isLoading ? (
          <Flex direction="column" gap="12px" minH="200px">
            <Skeleton
              alignSelf="flex-start"
              h="56px"
              w="72%"
              maxW="320px"
              borderRadius="16px"
            />
            <Skeleton
              alignSelf="flex-end"
              h="48px"
              w="58%"
              maxW="260px"
              borderRadius="16px"
            />
            <Skeleton
              alignSelf="flex-start"
              h="44px"
              w="64%"
              maxW="280px"
              borderRadius="16px"
            />
          </Flex>
        ) : isError ? (
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Failed to load messages'
            }
            onRetry={() => void refetch()}
            minH="200px"
            py="24px"
          />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start the conversation by sending a reply below."
            minH="200px"
            py="24px"
          />
        ) : (
          <Flex direction="column" gap="12px">
            {messages.map((item) => (
              <MessageBubble key={item.id} message={item} />
            ))}
            {peerTyping ? (
              <Text fontSize="13px" color="ink.300">
                Guest is typing…
              </Text>
            ) : null}
            <Box ref={endRef} />
          </Flex>
        )}
      </Box>

      {sendError ? (
        <Text px="18px" pt="8px" color="red.500" fontSize="13px">
          {sendError}
        </Text>
      ) : null}

      {closed ? (
        <Flex
          gap="10px"
          px="18px"
          py="14px"
          borderTop="1px solid"
          borderColor="line.500"
          bg="white"
          flexShrink={0}
          align="center"
          justify="space-between"
        >
          <Text fontSize="13px" color="ink.300">
            This conversation is closed. Continue to reply on the same thread.
          </Text>
          <Button
            h="44px"
            flexShrink={0}
            isLoading={reopen.isPending}
            onClick={() => void reopen.mutateAsync(conversation.id)}
          >
            Continue
          </Button>
        </Flex>
      ) : (
        <Flex
          gap="10px"
          px="18px"
          py="14px"
          borderTop="1px solid"
          borderColor="line.500"
          bg="white"
          flexShrink={0}
        >
          <Input
            h="44px"
            bg="bg.400"
            borderColor="line.500"
            borderRadius="12px"
            placeholder="Write a reply…"
            value={draft}
            isDisabled={sending}
            onChange={(event) => {
              setDraft(event.target.value);
              notifyTyping();
            }}
            onBlur={() => stopTyping()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button
            h="44px"
            leftIcon={<LuSend size={16} />}
            isDisabled={sending || draft.trim().length === 0}
            isLoading={sending}
            onClick={() => void handleSend()}
          >
            Send
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

function MessageBubble({ message }: { message: ThreadMessage }) {
  const isStaff = message.senderType === 'staff';
  const pending = message.id.startsWith('temp-');

  return (
    <Flex justify={isStaff ? 'flex-end' : 'flex-start'}>
      <Box
        maxW={{ base: '90%', md: '75%' }}
        bg={isStaff ? 'brand.500' : 'white'}
        color={isStaff ? 'white' : 'ink.500'}
        border="1px solid"
        borderColor={isStaff ? 'brand.500' : 'line.500'}
        borderRadius="16px"
        px="14px"
        py="10px"
        opacity={pending ? 0.75 : 1}
      >
        <Text fontSize="14px" whiteSpace="pre-wrap">
          {message.body}
        </Text>
        <Text
          mt="6px"
          fontSize="11px"
          color={isStaff ? 'whiteAlpha.800' : 'ink.300'}
        >
          {message.senderName ?? (isStaff ? 'Staff' : 'Guest')} ·{' '}
          {formatMessageTime(message.createdAt)}
        </Text>
      </Box>
    </Flex>
  );
}
