'use client';

import {
  Box,
  Flex,
  Grid,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { RefundDetailDrawer } from '@/features/refunds/components/refund-detail-drawer';
import {
  getRefundColumns,
  renderRefundMobileCard,
} from '@/features/refunds/components/refund-table-config';
import { useRefunds } from '@/features/refunds/hooks/use-refunds';
import {
  countRefundTabs,
  DEFAULT_REFUND_FILTERS,
  filterRefunds,
  REFUND_REASON_OPTIONS,
  type RefundFilters,
  type RefundStatusTab,
} from '@/features/refunds/utils/refund-filters';
import type { RefundReason } from '@/shared/types/hospitable';
import {
  DataTable,
  FilterTabs,
  PageHeader,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function RefundsPage() {
  const { data, isLoading, isError, error } = useRefunds();
  const [filters, setFilters] = useState<RefundFilters>(DEFAULT_REFUND_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const showDrawerInline = useBreakpointValue({ base: false, xl: true });

  const refunds = data ?? [];
  const tabCounts = useMemo(() => countRefundTabs(refunds), [refunds]);
  const filtered = useMemo(
    () => filterRefunds(refunds, filters),
    [filters, refunds],
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
    refunds.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const updateFilters = (next: Partial<RefundFilters>) => {
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
        {error instanceof Error ? error.message : 'Failed to load refunds'}
      </Text>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Refunds"
        description="Review refund requests and track Flutterwave payouts."
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
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 350px' }}
        gap="18px"
        alignItems="start"
      >
        <Panel pt="18px" minW={0}>
          <FilterTabs<RefundStatusTab>
            value={filters.tab}
            onChange={(tab) => updateFilters({ tab })}
            items={[
              { id: 'all', label: 'All', count: tabCounts.all },
              {
                id: 'needs_action',
                label: 'Needs action',
                count: tabCounts.needs_action,
              },
              {
                id: 'processing',
                label: 'Processing',
                count: tabCounts.processing,
              },
              {
                id: 'completed',
                label: 'Completed',
                count: tabCounts.completed,
              },
              {
                id: 'rejected',
                label: 'Rejected',
                count: tabCounts.rejected,
              },
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
                placeholder="Search guest, booking, payment…"
                value={filters.search}
                onChange={(event) =>
                  updateFilters({ search: event.target.value })
                }
              />
            </InputGroup>

            <Select
              h="40px"
              maxW="190px"
              borderColor="line.500"
              borderRadius="10px"
              bg="white"
              fontSize="13px"
              fontWeight={600}
              color="ink.400"
              value={filters.reason}
              onChange={(event) =>
                updateFilters({
                  reason:
                    event.target.value === 'all'
                      ? 'all'
                      : (event.target.value as RefundReason),
                })
              }
            >
              <option value="all">All reasons</option>
              {REFUND_REASON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Flex>

          <DataTable
            columns={getRefundColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            renderMobileCard={renderRefundMobileCard}
            minWidth="920px"
            emptyMessage="No refunds match your filters"
          />
        </Panel>

        {showDrawerInline ? (
          <RefundDetailDrawer refund={selected} />
        ) : selected ? (
          <Box display={{ base: 'block', xl: 'none' }}>
            <RefundDetailDrawer refund={selected} />
          </Box>
        ) : null}
      </Grid>
    </Box>
  );
}
