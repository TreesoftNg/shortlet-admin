'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { LuSend } from 'react-icons/lu';
import type { ConversationListItem } from '@/mocks/data/messaging';
import { StatusBadge } from '@/shared/components/ui';
import type { Message } from '@/shared/types/hospitable';
import { useConversationMessages } from '../hooks/use-messages';
import { formatMessageTime } from '../utils/message-filters';

type MessageThreadProps = {
  conversation: ConversationListItem | null;
};

export function MessageThread({ conversation }: MessageThreadProps) {
  const { data, isLoading } = useConversationMessages(conversation?.id ?? null);

  if (!conversation) {
    return (
      <Flex
        h="100%"
        minH="420px"
        align="center"
        justify="center"
        color="ink.300"
        fontSize="14px"
        px="24px"
        textAlign="center"
      >
        Select a conversation to view messages.
      </Flex>
    );
  }

  const messages = data ?? [];

  return (
    <Flex direction="column" h="100%" minH="420px">
      <Flex
        px="18px"
        py="14px"
        borderBottom="1px solid"
        borderColor="line.500"
        align="center"
        gap="12px"
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
            {conversation.reservation
              ? `${conversation.reservation.property?.name ?? 'Property'} · ${conversation.reservation.platform_id}`
              : 'General inquiry'}
          </Text>
        </Box>
        <StatusBadge tone={conversation.status === 'open' ? 'ok' : 'mute'}>
          {conversation.status === 'open' ? 'Open' : 'Closed'}
        </StatusBadge>
      </Flex>

      <Box flex="1" overflowY="auto" px="18px" py="16px" bg="bg.400">
        {isLoading ? (
          <Flex minH="200px" align="center" justify="center">
            <Spinner color="brand.500" />
          </Flex>
        ) : (
          <Flex direction="column" gap="12px">
            {messages.map((item) => (
              <MessageBubble key={item.id} message={item} />
            ))}
          </Flex>
        )}
      </Box>

      <Flex
        gap="10px"
        px="18px"
        py="14px"
        borderTop="1px solid"
        borderColor="line.500"
        bg="white"
      >
        <Input
          h="44px"
          bg="bg.400"
          borderColor="line.500"
          borderRadius="12px"
          placeholder="Write a reply…"
          isDisabled={conversation.status === 'closed'}
        />
        <Button
          h="44px"
          leftIcon={<LuSend size={16} />}
          isDisabled={conversation.status === 'closed'}
        >
          Send
        </Button>
      </Flex>
    </Flex>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isHost = message.sender_type === 'host';

  return (
    <Flex justify={isHost ? 'flex-end' : 'flex-start'}>
      <Box
        maxW={{ base: '90%', md: '75%' }}
        bg={isHost ? 'brand.500' : 'white'}
        color={isHost ? 'white' : 'ink.500'}
        border="1px solid"
        borderColor={isHost ? 'brand.500' : 'line.500'}
        borderRadius="16px"
        px="14px"
        py="10px"
      >
        <Text fontSize="14px" whiteSpace="pre-wrap">
          {message.body}
        </Text>
        <Text
          mt="6px"
          fontSize="11px"
          color={isHost ? 'whiteAlpha.800' : 'ink.300'}
        >
          {message.sender.full_name} · {formatMessageTime(message.created_at)}
        </Text>
      </Box>
    </Flex>
  );
}
