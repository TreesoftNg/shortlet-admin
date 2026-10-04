'use client';

import { Box, Button, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LuMenu, LuPlus } from 'react-icons/lu';
import { useProperties } from '@/features/properties/hooks/use-properties';
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
import { parsePropertyIdFilter } from '@/shared/utils/property-id';

export function UnitsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error, refetch } = useUnits();
  const { data: properties = [] } = useProperties();
  const [filters, setFilters] = useState<UnitFilters>(DEFAULT_UNIT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  useEffect(() => {
    const propertyIdParam = searchParams.get('propertyId');
    if (!propertyIdParam) return;
    const propertyId = parsePropertyIdFilter(propertyIdParam);
    setFilters((current) =>
      current.propertyId === propertyId
        ? current
        : { ...current, propertyId },
    );
  }, [searchParams]);

  const units = useMemo(
    () => enrichUnitsWithProperty(data ?? [], properties),
    [data, properties],
  );

  const tabCounts = useMemo(() => countUnitTabs(units), [units]);
  const filtered = useMemo(() => filterUnits(units, filters), [filters, units]);

  const selected = units.find((item) => item.id === selectedId) ?? null;
  const filteredProperty =
    filters.propertyId === 'all'
      ? null
      : properties.find((item) => String(item.id) === filters.propertyId) ?? null;

  const updateFilters = (next: Partial<UnitFilters>) => {
    setFilters((current) => {
      const merged = { ...current, ...next };
      if (next.propertyId !== undefined) {
        const params = new URLSearchParams(searchParams.toString());
        if (merged.propertyId === 'all') {
          params.delete('propertyId');
        } else {
          params.set('propertyId', String(merged.propertyId));
        }
        const query = params.toString();
        router.replace(query ? `/units?${query}` : '/units', { scroll: false });
      }
      return merged;
    });
  };

  const addUnitHref =
    filters.propertyId === 'all'
      ? '/units/new'
      : `/units/new?propertyId=${filters.propertyId}`;

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
        description={
          filteredProperty
            ? `Inventory for ${filteredProperty.name}.`
            : 'Bookable inventory under each property.'
        }
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
            <Button
              as={Link}
              href={addUnitHref}
              h="44px"
              leftIcon={<LuPlus size={16} />}
            >
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
          properties={properties}
          onFiltersChange={updateFilters}
        />

        {units.length === 0 ? (
          <EmptyState
            title="No units yet"
            description="Add your first unit to start managing inventory."
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
            emptyMessage={
              filteredProperty
                ? `No units found for ${filteredProperty.name}`
                : 'No units match your filters'
            }
          />
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Unit details"
        size="5xl"
        maxWidth="1080px"
      >
        <UnitDetailDrawer
          unit={selected}
          onEdit={() => {
            if (!selected) return;
            setSelectedId(null);
            router.push(`/units/${selected.id}/edit`);
          }}
          onAvailability={() => {
            if (!selected) return;
            setSelectedId(null);
            router.push(
              `/availability?propertyId=${selected.property_id}&unitId=${selected.id}`,
            );
          }}
        />
      </AppModal>
    </Box>
  );
}
