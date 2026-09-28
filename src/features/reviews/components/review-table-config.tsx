'use client';

import { Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { LuStar } from 'react-icons/lu';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui';
import type { Review } from '@/shared/types/hospitable';
import {
  formatReviewDate,
  getModerationDisplay,
} from '../utils/review-filters';

export function getReviewColumns(): DataTableColumn<Review>[] {
  return [
    {
      id: 'guest',
      header: 'Guest',
      cell: (row) => (
        <Flex direction="column">
          <Text fontWeight={700}>{row.guest?.full_name ?? '—'}</Text>
          <Text color="ink.300" fontSize="12px" textTransform="capitalize">
            {row.platform}
          </Text>
        </Flex>
      ),
    },
    {
      id: 'property',
      header: 'Property',
      cell: (row) => row.reservation?.property?.name ?? '—',
    },
    {
      id: 'rating',
      header: 'Rating',
      cell: (row) => (
        <Flex align="center" gap="4px" fontWeight={700}>
          <LuStar size={14} fill="currentColor" />
          {row.public.rating}.0
        </Flex>
      ),
    },
    {
      id: 'review',
      header: 'Review',
      meta: { whiteSpace: 'normal' },
      cell: (row) => (
        <Text noOfLines={2} maxW="280px">
          {row.public.review ?? '—'}
        </Text>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      cell: (row) => formatReviewDate(row.reviewed_at),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getModerationDisplay(row.moderation_status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
  ];
}

export function renderReviewMobileCard(review: Review): ReactNode {
  const status = getModerationDisplay(review.moderation_status);

  return (
    <>
      <Flex justify="space-between" gap="8px" mb="8px" align="flex-start">
        <Flex direction="column" minW={0}>
          <Text fontWeight={700} noOfLines={1}>
            {review.guest?.full_name ?? '—'}
          </Text>
          <Text color="ink.300" fontSize="12px" noOfLines={1}>
            {review.reservation?.property?.name ?? '—'}
          </Text>
        </Flex>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>
      <Flex align="center" gap="4px" fontWeight={700} mb="6px">
        <LuStar size={14} fill="currentColor" />
        {review.public.rating}.0
      </Flex>
      <Text fontSize="13px" color="ink.400" noOfLines={3}>
        {review.public.review ?? 'No public review text'}
      </Text>
    </>
  );
}
