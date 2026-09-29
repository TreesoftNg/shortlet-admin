'use client';

import { Box, Button, IconButton } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuPlus } from 'react-icons/lu';
import { CustomerDetailDrawer } from '@/features/customers/components/customer-detail-drawer';
import { getCustomerColumns } from '@/features/customers/components/customer-table-config';
import { CustomersToolbar } from '@/features/customers/components/customers-toolbar';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import {
  countCustomerTabs,
  DEFAULT_CUSTOMER_FILTERS,
  filterCustomers,
  getCustomerLocations,
  type CustomerFilters,
  type CustomerStatusTab,
} from '@/features/customers/utils/customer-filters';
import {
  AppModal,
  DataTable,
  EmptyState,
  ErrorState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function CustomersPage() {
  const { data, isLoading, isError, error, refetch } = useCustomers();
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const customers = data ?? [];
  const tabCounts = useMemo(() => countCustomerTabs(customers), [customers]);
  const locations = useMemo(() => getCustomerLocations(customers), [customers]);
  const filtered = useMemo(
    () => filterCustomers(customers, filters),
    [customers, filters],
  );

  const selected = customers.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<CustomerFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load customers'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Customers"
        description="Guests who book and stay across your properties."
        actions={
          <>
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
            <Button h="44px" leftIcon={<LuPlus size={16} />}>
              Add customer
            </Button>
          </>
        }
      />

      <Panel pt="18px" minW={0}>
        <FilterTabs<CustomerStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'with_stays', label: 'With stays', count: tabCounts.with_stays },
            { id: 'new', label: 'New', count: tabCounts.new },
          ]}
        />

        <CustomersToolbar
          filters={filters}
          locations={locations}
          onFiltersChange={updateFilters}
        />

        {customers.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description="When customers are available, they will show up here."
          />
        ) : (
          <DataTable
            columns={getCustomerColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            minWidth="760px"
            emptyTitle="No matches"
            emptyMessage="No customers match your filters"
          />
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Customer details"
        size="xl"
      >
        <CustomerDetailDrawer customer={selected} />
      </AppModal>
    </Box>
  );
}
