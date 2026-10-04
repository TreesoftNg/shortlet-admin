'use client';

import { Box, Button, IconButton } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LuMenu, LuPlus } from 'react-icons/lu';
import { PropertyDetailDrawer } from '@/features/properties/components/property-detail-drawer';
import {
  getPropertyColumns,
  type PropertyListItem,
} from '@/features/properties/components/property-table-config';
import { PropertiesToolbar } from '@/features/properties/components/properties-toolbar';
import { useProperties } from '@/features/properties/hooks/use-properties';
import {
  countPropertyTabs,
  DEFAULT_PROPERTY_FILTERS,
  filterProperties,
  getPropertyCities,
  type PropertyFilters,
  type PropertyStatusTab,
} from '@/features/properties/utils/property-filters';
import { useUnits } from '@/features/units/hooks/use-units';
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

export function PropertiesPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useProperties();
  const { data: units = [] } = useUnits();
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_PROPERTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const properties = useMemo<PropertyListItem[]>(() => {
    const list = data ?? [];
    return list.map((property) => {
      const counted = units.filter(
        (unit) => unit.property_id === property.id,
      ).length;
      return {
        ...property,
        unit_count: property.unit_count > 0 ? property.unit_count : counted,
      };
    });
  }, [data, units]);

  const tabCounts = useMemo(() => countPropertyTabs(properties), [properties]);
  const cities = useMemo(() => getPropertyCities(properties), [properties]);
  const filtered = useMemo(
    () => filterProperties(properties, filters),
    [filters, properties],
  );

  const selected = properties.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<PropertyFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load properties'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Properties"
        description="Manage listings, channels, amenities and inventory."
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
              href="/properties/new"
              h="44px"
              leftIcon={<LuPlus size={16} />}
            >
              Add property
            </Button>
          </>
        }
      />

      <Panel pt="18px" minW={0}>
        <FilterTabs<PropertyStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'listed', label: 'Listed', count: tabCounts.listed },
            { id: 'unlisted', label: 'Unlisted', count: tabCounts.unlisted },
            { id: 'archived', label: 'Archived', count: tabCounts.archived },
          ]}
        />

        <PropertiesToolbar
          filters={filters}
          cities={cities}
          onFiltersChange={updateFilters}
        />

        {properties.length === 0 ? (
          <EmptyState
            title="No properties yet"
            description="Add your first property to start managing inventory."
          />
        ) : (
          <DataTable
            columns={getPropertyColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            minWidth="820px"
            emptyTitle="No matches"
            emptyMessage="No properties match your filters"
          />
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Property details"
        size="5xl"
        maxWidth="1080px"
      >
        <PropertyDetailDrawer
          property={selected}
          onEdit={() => {
            if (!selected) return;
            setSelectedId(null);
            router.push(`/properties/${selected.id}/edit`);
          }}
          onManageUnits={() => {
            if (!selected) return;
            setSelectedId(null);
            router.push(`/units?propertyId=${selected.id}`);
          }}
          onArchivedOrRestored={() => setSelectedId(null)}
        />
      </AppModal>
    </Box>
  );
}
