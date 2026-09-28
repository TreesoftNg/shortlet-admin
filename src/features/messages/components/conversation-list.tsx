'use client';

import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import type { ConversationListItem } from '@/mocks/data/messaging';
import { StatusBadge } from '@/shared/components/ui';
import { formatMessageTime } from '../utils/message-filters';

type ConversationListProps = {
  conversations: ConversationListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <Text color="ink.300" fontSize="14px" py="24px" textAlign="center">
        No conversations match your filters
      </Text>
    );
  }

  return (
    <Flex direction="column">
      {conversations.map((conversation) => {
        const active = conversation.id === selectedId;
        const unread = conversation.unread_count > 0;

        return (
          <Flex
            key={conversation.id}
            as="button"
            type="button"
            textAlign="left"
            w="100%"
            gap="12px"
            px="14px"
            py="14px"
            borderBottom="1px solid"
            borderColor="line.400"
            bg={active ? 'brand.50' : 'transparent'}
            boxShadow={active ? 'inset 3px 0 0 var(--brand)' : undefined}
            _hover={{ bg: active ? 'brand.50' : 'bg.400' }}
            onClick={() => onSelect(conversation.id)}
          >
            <Avatar
              size="md"
              name={conversation.guest?.full_name ?? undefined}
              src={conversation.guest?.picture_url ?? undefined}
              flexShrink={0}
            />
            <Box minW={0} flex="1">
              <Flex justify="space-between" gap="8px" mb="2px">
                <Text
                  fontWeight={unread ? 800 : 700}
                  fontSize="14px"
                  noOfLines={1}
                >
                  {conversation.guest?.full_name ?? 'Unknown guest'}
                </Text>
                <Text color="ink.300" fontSize="11px" flexShrink={0}>
                  {formatMessageTime(conversation.last_message_at)}
                </Text>
              </Flex>
              <Text color="ink.300" fontSize="12px" mb="4px" noOfLines={1}>
                {conversation.reservation?.property?.name ??
                  conversation.reservation?.platform_id ??
                  'Inquiry'}
              </Text>
              <Flex justify="space-between" gap="8px" align="center">
                <Text
                  fontSize="13px"
                  color={unread ? 'ink.500' : 'ink.400'}
                  fontWeight={unread ? 600 : 400}
                  noOfLines={1}
                >
                  {conversation.preview}
                </Text>
                {unread ? (
                  <Box
                    bg="brand.500"
                    color="white"
                    fontSize="11px"
                    borderRadius="full"
                    px="7px"
                    py="1px"
                    flexShrink={0}
                  >
                    {conversation.unread_count}
                  </Box>
                ) : conversation.status === 'closed' ? (
                  <StatusBadge tone="mute">Closed</StatusBadge>
                ) : null}
              </Flex>
            </Box>
          </Flex>
        );
      })}
    </Flex>
  );
}
