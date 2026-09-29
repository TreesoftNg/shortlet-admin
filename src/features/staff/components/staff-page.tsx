'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuPlus, LuSearch } from 'react-icons/lu';
import { StaffDetailDrawer } from '@/features/staff/components/staff-detail-drawer';
import { getStaffColumns } from '@/features/staff/components/staff-table-config';
import { useStaff } from '@/features/staff/hooks/use-staff';
import {
  countStaffTabs,
  DEFAULT_STAFF_FILTERS,
  filterStaff,
  STAFF_ROLE_OPTIONS,
  type StaffFilters,
  type StaffStatusTab,
} from '@/features/staff/utils/staff-filters';
import type { StaffRole } from '@/shared/types/hospitable';
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

export function StaffPage() {
  const { data, isLoading, isError, error, refetch } = useStaff();
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const members = data ?? [];
  const tabCounts = useMemo(() => countStaffTabs(members), [members]);
  const filtered = useMemo(
    () => filterStaff(members, filters),
    [filters, members],
  );

  const selected = members.find((item) => item.id === selectedId) ?? null;

  const updateFilters = (next: Partial<StaffFilters>) => {
    setFilters((current) => ({ ...current, ...next }));
  };

  if (isLoading) {
    return <PageSkeleton variant="table" />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load staff'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      <PageHeader
        title="Staff"
        description="Manage team access, roles, and invitations."
        actions={
          <Flex gap="8px" align="center">
            <Button
              leftIcon={<LuPlus size={16} />}
              display={{ base: 'none', md: 'inline-flex' }}
              borderRadius="12px"
              h="40px"
            >
              Invite member
            </Button>
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

      <Panel pt="18px" minW={0}>
        <FilterTabs<StaffStatusTab>
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
          items={[
            { id: 'all', label: 'All', count: tabCounts.all },
            { id: 'active', label: 'Active', count: tabCounts.active },
            { id: 'invited', label: 'Invited', count: tabCounts.invited },
            {
              id: 'suspended',
              label: 'Suspended',
              count: tabCounts.suspended,
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
              placeholder="Search name, email, role…"
              value={filters.search}
              onChange={(event) =>
                updateFilters({ search: event.target.value })
              }
            />
          </InputGroup>

          <Select
            h="40px"
            maxW="170px"
            borderColor="line.500"
            borderRadius="10px"
            bg="white"
            fontSize="13px"
            fontWeight={600}
            color="ink.400"
            value={filters.role}
            onChange={(event) =>
              updateFilters({
                role:
                  event.target.value === 'all'
                    ? 'all'
                    : (event.target.value as StaffRole),
              })
            }
          >
            <option value="all">All roles</option>
            {STAFF_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Flex>

        {members.length === 0 ? (
          <EmptyState
            title="No staff yet"
            description="When staff members are available, they will show up here."
          />
        ) : (
          <DataTable
            columns={getStaffColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            minWidth="860px"
            emptyTitle="No matches"
            emptyMessage="No staff members match your filters"
          />
        )}
      </Panel>

      <AppModal
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title="Staff details"
        size="lg"
      >
        <StaffDetailDrawer member={selected} />
      </AppModal>
    </Box>
  );
}
