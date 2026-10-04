'use client';

import { Box, Button, Flex, Heading, Text, useToast } from '@chakra-ui/react';
import { LuStar } from 'react-icons/lu';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import { ApiClientError } from '@/shared/api/types';
import { useHideReview, usePublishReview } from '../hooks/use-review-mutations';
import type { Review } from '../types';
import { formatReviewDate, getModerationDisplay } from '../utils/review-filters';

type ReviewDetailDrawerProps = {
  review: Review | null;
  canManage: boolean;
};

export function ReviewDetailDrawer({ review, canManage }: ReviewDetailDrawerProps) {
  const toast = useToast();
  const hide = useHideReview();
  const publish = usePublishReview();

  if (!review) {
    return null;
  }

  const status = getModerationDisplay(review.status);
  const isSaving = hide.isPending || publish.isPending;

  const showError = (title: string, err: unknown) => {
    toast({
      title,
      description: err instanceof ApiClientError || err instanceof Error ? err.message : undefined,
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap="12px" mb="12px">
        <Box minW={0}>
          <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
            {review.guestFullName || 'Guest'}
          </Heading>
          <Text color="ink.400" fontSize="13px" mt="2px" noOfLines={1}>
            {review.unitName || 'Unit'}
          </Text>
        </Box>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>

      <Flex align="center" gap="6px" fontSize="22px" fontWeight={800} mb="12px">
        <LuStar size={20} fill="currentColor" />
        {review.rating}.0
      </Flex>

      <Text fontSize="14px" color="ink.500" mb="12px">
        {review.comment ?? 'No public review text.'}
      </Text>

      {review.adminResponse ? (
        <Box bg="bg.400" borderRadius="12px" p="12px" mb="8px">
          <Text fontSize="12px" fontWeight={700} color="ink.300" mb="4px">
            Host response
          </Text>
          <Text fontSize="14px">{review.adminResponse}</Text>
        </Box>
      ) : null}

      <KeyValueList
        title="Meta"
        items={[
          {
            label: 'Guest email',
            value: <Text as="b">{review.guestEmail || '—'}</Text>,
          },
          {
            label: 'Reviewed',
            value: <Text as="b">{formatReviewDate(review.createdAt)}</Text>,
          },
          {
            label: 'Responded',
            value: <Text as="b">{formatReviewDate(review.respondedAt)}</Text>,
          },
        ]}
      />

      {canManage ? (
        <Flex gap="8px" mt="16px" wrap="wrap">
          {review.status !== 'published' ? (
            <Button
              size="sm"
              variant="dark"
              flex="1"
              minW="110px"
              isLoading={publish.isPending}
              isDisabled={isSaving}
              onClick={() =>
                void publish.mutateAsync(review.id).catch((err) => showError('Could not publish', err))
              }
            >
              Publish
            </Button>
          ) : null}
          {review.status !== 'hidden' ? (
            <Button
              size="sm"
              variant="soft"
              isLoading={hide.isPending}
              isDisabled={isSaving}
              onClick={() =>
                void hide.mutateAsync(review.id).catch((err) => showError('Could not hide', err))
              }
            >
              Hide
            </Button>
          ) : null}
        </Flex>
      ) : null}
    </Box>
  );
}
