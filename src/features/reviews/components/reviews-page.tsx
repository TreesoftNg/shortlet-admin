'use client';

import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { ReviewDetailDrawer } from '@/features/reviews/components/review-detail-drawer';
import { getReviewColumns } from '@/features/reviews/components/review-table-config';
import { useReviews } from '@/features/reviews/hooks/use-reviews';
import {
  countReviewTabs,
  DEFAULT_REVIEW_FILTERS,
  filterReviews,
  type ReviewFilters,
  type ReviewStatusTab,
} from '@/features/reviews/utils/review-filters';
import {
  AppModal,
  DataTable,
  FilterTabs,
  PageHeader,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function ReviewsPage() {
  const { data, isLoading, isError, error } = useReviews();
  const [filters, setFilters] = useState<ReviewFilters>(DEFAULT_REVIEW_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const reviews = data ?? [];
  const tabCounts = useMemo(() => countReviewTabs(reviews), [reviews]);
  const filtered = useMemo(
    () => filterReviews(reviews, filters),
    [filters, reviews],
  );

  const selected = reviews.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<ReviewFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return (
      <Flex minH="320px" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Text color="status.danger">
        {error instanceof Error ? error.message : 'Failed to load reviews'}
      </Text>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Reviews"
        description="Moderate guest feedback and respond to public reviews."
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

      <Panel pt="18px" minW={0}>
        <FilterTabs<ReviewStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'pending', label: 'Pending', count: tabCounts.pending },
            {
              id: 'needs_response',
              label: 'Needs reply',
              count: tabCounts.needs_response,
            },
            { id: 'published', label: 'Published', count: tabCounts.published },
            { id: 'hidden', label: 'Hidden', count: tabCounts.hidden },
          ]}
        />

        <Flex gap="10px" mb="14px" wrap="wrap" align="center">
          <InputGroup flex="1" minW={{ base: '100%', md: '240px' }}>
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
              placeholder="Search guest, property, review…"
              value={filters.search}
              onChange={(event) =>
                updateFilters({ search: event.target.value })
              }
            />
          </InputGroup>

          <Select
            h="40px"
            maxW="160px"
            borderColor="line.500"
            borderRadius="10px"
            bg="white"
            fontSize="13px"
            fontWeight={600}
            color="ink.400"
            value={String(filters.minRating)}
            onChange={(event) =>
              updateFilters({
                minRating:
                  event.target.value === 'all'
                    ? 'all'
                    : Number(event.target.value),
              })
            }
          >
            <option value="all">All ratings</option>
            <option value="5">5 stars</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
            <option value="2">2+ stars</option>
          </Select>
        </Flex>

        <DataTable
          columns={getReviewColumns()}
          data={filtered}
          getRowId={(row) => row.id}
          selectedId={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          minWidth="860px"
          emptyMessage="No reviews match your filters"
        />
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Review details"
        size="lg"
      >
        <ReviewDetailDrawer review={selected} />
      </AppModal>
    </Box>
  );
}
