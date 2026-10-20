'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { LuMenu, LuPlus, LuSearch } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import {
  ConfirmModal,
  DataTable,
  EmptyState,
  ErrorState,
  FilterTabs,
  PageHeader,
  PageSkeleton,
  Panel,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { useFacilitiesCatalog } from '../hooks/use-facilities-catalog';
import {
  useArchiveFacility,
  useRestoreFacility,
} from '../hooks/use-facility-mutations';
import type { Facility } from '../types';
import {
  countFacilityTabs,
  DEFAULT_FACILITY_FILTERS,
  filterFacilities,
  type FacilityFilters,
  type FacilityStatusTab,
} from '../utils/facility-filters';
import { getFacilityColumns } from './facility-table-config';

export function FacilitiesPage() {
  const toast = useToast();
  const router = useRouter();
  const { data: profile } = useMe();
  const canRead = hasPermission(profile, 'property.read');
  const canManage = hasPermission(profile, 'property.update');
  const { data, isLoading, isError, error, refetch } = useFacilitiesCatalog({
    enabled: canRead,
  });
  const archive = useArchiveFacility();
  const restore = useRestoreFacility();

  const [filters, setFilters] = useState<FacilityFilters>(DEFAULT_FACILITY_FILTERS);
  const [pendingDelete, setPendingDelete] = useState<Facility | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const facilities = useMemo(() => data ?? [], [data]);
  const tabCounts = useMemo(() => countFacilityTabs(facilities), [facilities]);
  const filtered = useMemo(
    () => filterFacilities(facilities, filters),
    [facilities, filters],
  );

  const pendingId =
    (archive.isPending && archive.variables) ||
    (restore.isPending && restore.variables) ||
    null;

  const updateFilters = (next: Partial<FacilityFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  const openEdit = (facility: Facility) => {
    router.push(`/facilities/${facility.id}/edit`);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await archive.mutateAsync(pendingDelete.id);
      toast({
        title: 'Facility deleted',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
      setPendingDelete(null);
    } catch (err) {
      toast({
        title: 'Could not delete facility',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const handleRestore = async (facility: Facility) => {
    try {
      await restore.mutateAsync(facility.id);
      toast({
        title: 'Facility restored',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not restore facility',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 3500,
        isClosable: true,
      });
    }
  };

  const actions = {
    canManage,
    onEdit: openEdit,
    onArchive: setPendingDelete,
    onRestore: (facility: Facility) => void handleRestore(facility),
    pendingId,
  };

  const header = (
    <PageHeader
      title="Facilities"
      description="Amenities and features for your properties and units."
      actions={
        <Flex gap="8px" align="center">
          {canManage ? (
            <>
              <Button
                as={Link}
                href="/facilities/new"
                leftIcon={<LuPlus size={16} />}
                display={{ base: 'none', md: 'inline-flex' }}
                borderRadius="12px"
                h="40px"
                isDisabled={!canRead}
              >
                Add facility
              </Button>
              <IconButton
                as={Link}
                href="/facilities/new"
                aria-label="Add facility"
                icon={<LuPlus size={18} />}
                display={{ base: 'inline-flex', md: 'none' }}
                borderRadius="12px"
                h="44px"
                w="44px"
                isDisabled={!canRead}
              />
            </>
          ) : null}
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
        </Flex>
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
            description="Your role does not include properties. Ask the business owner for access."
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
          error instanceof Error ? error.message : 'Failed to load facilities'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      {header}

      <Panel pt="18px" minW={0}>
        <FilterTabs<FacilityStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'active', label: 'Active', count: tabCounts.active },
            { id: 'archived', label: 'Deleted', count: tabCounts.archived },
          ]}
        />

        <Flex gap="10px" mb="14px" wrap="wrap" align="center">
          <InputGroup flex="1" minW={{ base: '100%', md: '240px' }} maxW={{ md: '320px' }}>
            <InputLeftElement pointerEvents="none" h="40px" color="ink.300">
              <LuSearch size={16} />
            </InputLeftElement>
            <Input
              h="40px"
              pl="40px"
              borderRadius="12px"
              borderColor="line.500"
              bg="white"
              fontSize="14px"
              placeholder="Search name or category…"
              value={filters.search}
              onChange={(event) => updateFilters({ search: event.target.value })}
            />
          </InputGroup>
        </Flex>

        <DataTable
          label="Facilities"
          columns={getFacilityColumns(actions)}
          data={filtered}
          getRowId={(row) => row.id}
          minWidth="720px"
          onRowClick={
            canManage
              ? (row) => {
                  if (row.status === 'active') openEdit(row);
                }
              : undefined
          }
          emptyTitle="No facilities yet"
          emptyMessage={
            canManage
              ? 'Add your first facility to use it on properties and units.'
              : 'Nothing matches these filters.'
          }
        />
      </Panel>

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete facility?"
        description={
          pendingDelete
            ? `“${pendingDelete.name}” will be hidden from pickers. Properties and units that already use it keep it.`
            : undefined
        }
        confirmLabel="Delete"
        isLoading={archive.isPending}
      />
    </Box>
  );
}
