'use client';

import { Box, Button, IconButton } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuPlus } from 'react-icons/lu';
import { UnitDetailDrawer } from '@/features/units/components/unit-detail-drawer';
import { getUnitColumns } from '@/features/units/components/unit-table-config';
import { UnitsToolbar } from '@/features/units/components/units-toolbar';
import { useUnits } from '@/features/units/hooks/use-units';
import {
  countUnitTabs,
  DEFAULT_UNIT_FILTERS,
  enrichUnitsWithProperty,
  filterUnits,
  type UnitFilters,
  type UnitStatusTab,
} from '@/features/units/utils/unit-filters';
import { mockProperties } from '@/mocks/data';
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

export function UnitsPage() {
  const { data, isLoading, isError, error, refetch } = useUnits();
  const [filters, setFilters] = useState<UnitFilters>(DEFAULT_UNIT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const units = useMemo(
    () => enrichUnitsWithProperty(data ?? [], mockProperties),
    [data],
  );

  const tabCounts = useMemo(() => countUnitTabs(units), [units]);
  const filtered = useMemo(() => filterUnits(units, filters), [filters, units]);

  const selected = units.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<UnitFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load units'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Units"
        description="Bookable inventory under each property."
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
              Add unit
            </Button>
          </>
        }
      />

      <Panel pt="18px" minW={0}>
        <FilterTabs<UnitStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'active', label: 'Active', count: tabCounts.active },
            {
              id: 'maintenance',
              label: 'Maintenance',
              count: tabCounts.maintenance,
            },
            { id: 'inactive', label: 'Inactive', count: tabCounts.inactive },
          ]}
        />

        <UnitsToolbar
          filters={filters}
          properties={mockProperties}
          onFiltersChange={updateFilters}
        />

        {units.length === 0 ? (
          <EmptyState
            title="No units yet"
            description="When units are available, they will show up here."
          />
        ) : (
          <DataTable
            columns={getUnitColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            minWidth="720px"
            emptyTitle="No matches"
            emptyMessage="No units match your filters"
          />
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Unit details"
        size="lg"
      >
        <UnitDetailDrawer unit={selected} />
      </AppModal>
    </Box>
  );
}
