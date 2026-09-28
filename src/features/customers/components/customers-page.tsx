'use client';

import {
  Box,
  Button,
  Flex,
  Grid,
  IconButton,
  Spinner,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { LuMenu, LuPlus } from 'react-icons/lu';
import { CustomerDetailDrawer } from '@/features/customers/components/customer-detail-drawer';
import {
  getCustomerColumns,
  renderCustomerMobileCard,
} from '@/features/customers/components/customer-table-config';
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
  DataTable,
  FilterTabs,
  PageHeader,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function CustomersPage() {
  const { data, isLoading, isError, error } = useCustomers();
  const [filters, setFilters] = useState<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const showDrawerInline = useBreakpointValue({ base: false, xl: true });

  const customers = data ?? [];
  const tabCounts = useMemo(() => countCustomerTabs(customers), [customers]);
  const locations = useMemo(() => getCustomerLocations(customers), [customers]);
  const filtered = useMemo(
    () => filterCustomers(customers, filters),
    [customers, filters],
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
    customers.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const updateFilters = (next: Partial<CustomerFilters>) => {
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
        {error instanceof Error ? error.message : 'Failed to load customers'}
      </Text>
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

      <Grid
        templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 350px' }}
        gap="18px"
        alignItems="start"
      >
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

          <DataTable
            columns={getCustomerColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            renderMobileCard={renderCustomerMobileCard}
            minWidth="760px"
            emptyMessage="No customers match your filters"
          />
        </Panel>

        {showDrawerInline ? (
          <CustomerDetailDrawer customer={selected} />
        ) : selected ? (
          <Box display={{ base: 'block', xl: 'none' }}>
            <CustomerDetailDrawer customer={selected} />
          </Box>
        ) : null}
      </Grid>
    </Box>
  );
}
