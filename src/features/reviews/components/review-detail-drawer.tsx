'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { LuStar } from 'react-icons/lu';
import type { Review } from '@/shared/types/hospitable';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import {
  formatReviewDate,
  getModerationDisplay,
} from '../utils/review-filters';

type ReviewDetailDrawerProps = {
  review: Review | null;
};

export function ReviewDetailDrawer({ review }: ReviewDetailDrawerProps) {
  if (!review) {
    return (
      <Box
        bg="white"
        border="1px solid"
        borderColor="line.500"
        borderRadius="22px"
        p="24px"
        color="ink.300"
        fontSize="14px"
      >
        Select a review to moderate or respond.
      </Box>
    );
  }

  const status = getModerationDisplay(review.moderation_status);

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="22px"
      overflow="hidden"
      alignSelf="start"
      position={{ xl: 'sticky' }}
      top={{ xl: '28px' }}
    >
      <Box px="22px" py="20px">
        <Flex justify="space-between" align="flex-start" gap="12px" mb="12px">
          <Box minW={0}>
            <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
              {review.guest?.full_name ?? 'Guest'}
            </Heading>
            <Text color="ink.400" fontSize="13px" mt="2px" noOfLines={1}>
              {review.reservation?.property?.name ?? 'Property'} ·{' '}
              {review.reservation?.platform_id ?? review.platform}
            </Text>
          </Box>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </Flex>

        <Flex align="center" gap="6px" fontSize="22px" fontWeight={800} mb="12px">
          <LuStar size={20} fill="currentColor" />
          {review.public.rating}.0
        </Flex>

        <Text fontSize="14px" color="ink.500" mb="12px">
          {review.public.review ?? 'No public review text.'}
        </Text>

        {review.public.response ? (
          <Box bg="bg.400" borderRadius="12px" p="12px" mb="8px">
            <Text fontSize="12px" fontWeight={700} color="ink.300" mb="4px">
              Host response
            </Text>
            <Text fontSize="14px">{review.public.response}</Text>
          </Box>
        ) : null}

        <KeyValueList
          title="Meta"
          items={[
            {
              label: 'Channel',
              value: (
                <Text as="b" textTransform="capitalize">
                  {review.platform}
                </Text>
              ),
            },
            {
              label: 'Reviewed',
              value: <Text as="b">{formatReviewDate(review.reviewed_at)}</Text>,
            },
            {
              label: 'Responded',
              value: <Text as="b">{formatReviewDate(review.responded_at)}</Text>,
            },
          ]}
        />

        {review.private.detailed_ratings ? (
          <Box py="16px" borderTop="1px solid" borderColor="line.500">
            <Text
              fontSize="12px"
              textTransform="uppercase"
              letterSpacing="0.05em"
              color="ink.300"
              fontWeight={700}
              mb="10px"
            >
              Private ratings
            </Text>
            <SimpleGrid columns={2} gap="8px">
              {review.private.detailed_ratings.map((item) => (
                <Flex
                  key={item.type}
                  justify="space-between"
                  bg="bg.400"
                  borderRadius="10px"
                  px="10px"
                  py="8px"
                  fontSize="13px"
                >
                  <Text textTransform="capitalize">{item.type}</Text>
                  <Text fontWeight={700}>{item.rating}</Text>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        ) : null}

        {review.can_respond && !review.public.response ? (
          <Box py="16px" borderTop="1px solid" borderColor="line.500">
            <Text
              fontSize="12px"
              textTransform="uppercase"
              letterSpacing="0.05em"
              color="ink.300"
              fontWeight={700}
              mb="10px"
            >
              Reply
            </Text>
            <Textarea
              placeholder="Write a public response…"
              borderColor="line.500"
              borderRadius="12px"
              minH="90px"
              mb="10px"
            />
            <Button size="sm" w="100%">
              Publish response
            </Button>
          </Box>
        ) : null}

        <Flex gap="8px" mt="12px" wrap="wrap">
          <Button size="sm" variant="dark" flex="1" minW="110px">
            Publish
          </Button>
          <Button size="sm" variant="soft">
            Hide
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
