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
import { PropertyDetailDrawer } from '@/features/properties/components/property-detail-drawer';
import {
  getPropertyColumns,
  renderPropertyMobileCard,
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
import { mockUnits } from '@/mocks/data';
import {
  DataTable,
  FilterTabs,
  PageHeader,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function PropertiesPage() {
  const { data, isLoading, isError, error } = useProperties();
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_PROPERTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const showDrawerInline = useBreakpointValue({ base: false, xl: true });

  const properties = useMemo<PropertyListItem[]>(() => {
    const list = data ?? [];
    return list.map((property) => ({
      ...property,
      unit_count: mockUnits.filter((unit) => unit.property_id === property.id).length,
    }));
  }, [data]);

  const tabCounts = useMemo(() => countPropertyTabs(properties), [properties]);
  const cities = useMemo(() => getPropertyCities(properties), [properties]);
  const filtered = useMemo(
    () => filterProperties(properties, filters),
    [filters, properties],
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
    properties.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  const updateFilters = (next: Partial<PropertyFilters>) => {
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
        {error instanceof Error ? error.message : 'Failed to load properties'}
      </Text>
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
            <Button h="44px" leftIcon={<LuPlus size={16} />}>
              Add property
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
          <FilterTabs<PropertyStatusTab>
            value={filters.tab}
            onChange={(tab) => updateFilters({ tab })}
            items={[
              { id: 'all', label: 'All', count: tabCounts.all },
              { id: 'listed', label: 'Listed', count: tabCounts.listed },
              { id: 'unlisted', label: 'Unlisted', count: tabCounts.unlisted },
            ]}
          />

          <PropertiesToolbar
            filters={filters}
            cities={cities}
            onFiltersChange={updateFilters}
          />

          <DataTable
            columns={getPropertyColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            renderMobileCard={renderPropertyMobileCard}
            minWidth="820px"
            emptyMessage="No properties match your filters"
          />
        </Panel>

        {showDrawerInline ? (
          <PropertyDetailDrawer property={selected} />
        ) : selected ? (
          <Box display={{ base: 'block', xl: 'none' }}>
            <PropertyDetailDrawer property={selected} />
          </Box>
        ) : null}
      </Grid>
    </Box>
  );
}
