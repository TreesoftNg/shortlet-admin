'use client';

import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { BookingDetailDrawer } from '@/features/bookings/components/booking-detail-drawer';
import { PaymentDetailDrawer } from '@/features/payments/components/payment-detail-drawer';
import { getPaymentColumns } from '@/features/payments/components/payment-table-config';
import { usePayments } from '@/features/payments/hooks/use-payments';
import {
  DEFAULT_PAYMENT_FILTERS,
  toListPaymentsParams,
  type PaymentFilters,
  type PaymentStatusTab,
} from '@/features/payments/utils/payment-filters';
import {
  AppModal,
  DataTable,
  EmptyState,
  ErrorState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Pagination,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function PaymentsPage() {
  const { data: profile } = useMe();
  const canRead = hasPermission(profile, 'payment.read');
  const [filters, setFilters] = useState<PaymentFilters>(DEFAULT_PAYMENT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const listParams = useMemo(() => toListPaymentsParams(filters), [filters]);
  const { data, isLoading, isError, error, refetch } = usePayments({
    params: listParams,
    enabled: canRead,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  const updateFilters = (next: Partial<PaymentFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const header = (
    <PageHeader
      title="Payments"
      description="Track charges, verify Flutterwave, and refund stays."
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
  );

  if (!canRead) {
    return (
      <Box>
        {header}
        <Panel>
          <EmptyState
            title="No access"
            description="Your role does not include payments. Ask the business owner for access."
          />
        </Panel>
      </Box>
    );
  }

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load payments'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      {header}

      <Panel pt="18px" minW={0}>
        <FilterTabs<PaymentStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab, page: 1 })}
          items={[
            { id: 'all', label: 'All' },
            { id: 'successful', label: 'Successful' },
            { id: 'pending', label: 'Pending' },
            { id: 'failed', label: 'Failed' },
            { id: 'refunds', label: 'Refunded' },
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
              placeholder="Search reference, Flutterwave id, booking…"
              value={filters.search}
              onChange={(event) =>
                updateFilters({ search: event.target.value, page: 1 })
              }
            />
          </InputGroup>
        </Flex>

        {total === 0 && !filters.search && filters.tab === 'all' ? (
          <EmptyState
            title="No payments yet"
            description="When guests pay for bookings, they will show up here."
          />
        ) : (
          <>
            <DataTable
              columns={getPaymentColumns()}
              data={items}
              getRowId={(row) => row.id}
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              minWidth="920px"
              emptyTitle="No matches"
              emptyMessage="No payments match your filters"
            />

            <Pagination
              page={data?.page ?? filters.page}
              totalPages={totalPages}
              total={total}
              pageSize={filters.pageSize}
              onPageChange={(page) => updateFilters({ page })}
            />
          </>
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selectedId)}
        onClose={() => setSelectedId(null)}
        title="Payment details"
        size="lg"
      >
        <PaymentDetailDrawer
          paymentId={selectedId}
          onOpenBooking={(id) => {
            setSelectedId(null);
            setBookingId(id);
          }}
        />
      </AppModal>

      <AppModal
        isOpen={Boolean(bookingId)}
        onClose={() => setBookingId(null)}
        title="Booking details"
        size="xl"
      >
        <BookingDetailDrawer bookingId={bookingId} />
      </AppModal>
    </Box>
  );
}
