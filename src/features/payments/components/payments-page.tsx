'use client';

import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { PaymentDetailDrawer } from '@/features/payments/components/payment-detail-drawer';
import { getPaymentColumns } from '@/features/payments/components/payment-table-config';
import { usePayments } from '@/features/payments/hooks/use-payments';
import {
  countPaymentTabs,
  DEFAULT_PAYMENT_FILTERS,
  filterPayments,
  type PaymentFilters,
  type PaymentStatusTab,
} from '@/features/payments/utils/payment-filters';
import {
  AppModal,
  DataTable,
  FilterTabs,
  PageHeader,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function PaymentsPage() {
  const { data, isLoading, isError, error } = usePayments();
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_PAYMENT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const payments = data ?? [];
  const tabCounts = useMemo(() => countPaymentTabs(payments), [payments]);
  const filtered = useMemo(
    () => filterPayments(payments, filters),
    [filters, payments],
  );

  const selected = payments.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<PaymentFilters>) => {
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
        {error instanceof Error ? error.message : 'Failed to load payments'}
      </Text>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Payments"
        description="Track charges, pending checkouts, and refunds across bookings."
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
        <FilterTabs<PaymentStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            {
              id: 'successful',
              label: 'Successful',
              count: tabCounts.successful,
            },
            { id: 'pending', label: 'Pending', count: tabCounts.pending },
            { id: 'failed', label: 'Failed', count: tabCounts.failed },
            { id: 'refunds', label: 'Refunds', count: tabCounts.refunds },
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
              placeholder="Search reference, guest, booking…"
              value={filters.search}
              onChange={(event) =>
                updateFilters({ search: event.target.value })
              }
            />
          </InputGroup>
        </Flex>

        <DataTable
          columns={getPaymentColumns()}
          data={filtered}
          getRowId={(row) => row.id}
          selectedId={selectedId}
          onRowClick={(row) => setSelectedId(row.id)}
          minWidth="920px"
          emptyMessage="No payments match your filters"
        />
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Payment details"
        size="lg"
      >
        <PaymentDetailDrawer payment={selected} />
      </AppModal>
    </Box>
  );
}
