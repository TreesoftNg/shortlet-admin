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
  Text,
  useToast,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { LuMenu, LuPlus, LuSearch } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { StaffDetailDrawer } from '@/features/staff/components/staff-detail-drawer';
import { StaffInviteModal } from '@/features/staff/components/staff-invite-modal';
import { getStaffColumns } from '@/features/staff/components/staff-table-config';
import { useStaff } from '@/features/staff/hooks/use-staff';
import {
  canInviteStaff,
  countStaffTabs,
  DEFAULT_STAFF_FILTERS,
  filterStaff,
  STAFF_ROLE_OPTIONS,
  type StaffFilters,
  type StaffStatusTab,
} from '@/features/staff/utils/staff-filters';
import type { StaffMember, StaffRole } from '@/shared/types/hospitable';
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
  const toast = useToast();
  const { data: profile } = useMe();
  const canRead = hasPermission(profile, 'staff.read');
  const { data, isLoading, isError, error, refetch } = useStaff({
    enabled: canRead,
  });
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const canInvite = canInviteStaff(profile);

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

  const handleInvited = (member: StaffMember) => {
    toast({
      title: 'Invite sent',
      description: `A password link was emailed to ${member.email}.`,
      status: 'success',
      duration: 3500,
      isClosable: true,
    });
  };

  const header = (
    <PageHeader
      title="Staff"
      description="Invite teammates. They receive an email with a password link."
      actions={
        <Flex gap="8px" align="center">
          <Button
            leftIcon={<LuPlus size={16} />}
            display={{ base: 'none', md: 'inline-flex' }}
            borderRadius="12px"
            h="40px"
            onClick={() => setInviteOpen(true)}
            isDisabled={!canInvite || !canRead}
          >
            Invite member
          </Button>
          <IconButton
            aria-label="Invite member"
            icon={<LuPlus size={18} />}
            display={{ base: 'inline-flex', md: 'none' }}
            borderRadius="12px"
            h="44px"
            w="44px"
            onClick={() => setInviteOpen(true)}
            isDisabled={!canInvite || !canRead}
          />
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
            description="Your role does not include staff. Ask the business owner for access."
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
        message={error instanceof Error ? error.message : 'Failed to load staff'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      {header}

      <Panel pt="18px" minW={0}>
        {!canInvite ? (
          <Text fontSize="13px" color="ink.300" mb="12px">
            Only an owner can invite staff. Sign in as an owner to send a
            password link.
          </Text>
        ) : null}

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
            borderRadius="12px"
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
            description={
              canInvite
                ? 'Invite a teammate. They will get an email to set a password.'
                : 'No staff members have been added for this account yet.'
            }
          />
        ) : (
          <DataTable
            columns={getStaffColumns()}
            data={filtered}
            getRowId={(row) => row.id}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            minWidth="760px"
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
        <StaffDetailDrawer member={selected} canInvite={canInvite} />
      </AppModal>

      <StaffInviteModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={handleInvited}
      />
    </Box>
  );
}
