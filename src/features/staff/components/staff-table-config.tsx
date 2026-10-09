'use client';

import { Avatar, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { timestampColumns } from '@/shared/components/ui/timestamp-columns';
import { StatusBadge } from '@/shared/components/ui';
import type { StaffMember } from '@/shared/types/hospitable';
import {
  formatStaffDateTime,
  getStaffRoleLabel,
  getStaffStatusDisplay,
} from '../utils/staff-filters';

export function getStaffColumns(): DataTableColumn<StaffMember>[] {
  return [
    {
      id: 'member',
      header: 'Member',
      cell: (row) => (
        <Flex align="center" gap="12px" minW={0}>
          <Avatar
            size="sm"
            name={row.full_name}
            src={row.avatar_url ?? undefined}
          />
          <Flex direction="column" minW={0}>
            <Flex align="center" gap="8px" minW={0}>
              <Text fontWeight={700} noOfLines={1}>
                {row.full_name}
              </Text>
              {row.is_you ? (
                <StatusBadge tone="mute">You</StatusBadge>
              ) : null}
            </Flex>
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {row.email}
            </Text>
          </Flex>
        </Flex>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: (row) => getStaffRoleLabel(row.role),
    },
    {
      id: 'activity',
      header: 'Activity',
      cell: (row) =>
        row.status === 'invited'
          ? `Invite expires ${formatStaffDateTime(row.invite_expires_at)}`
          : formatStaffDateTime(row.last_active_at),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getStaffStatusDisplay(row.status);
        return <StatusBadge tone={status.tone}>{status.label}</StatusBadge>;
      },
    },
    ...timestampColumns<StaffMember>(
      (row) => row.created_at,
      (row) => row.updated_at,
    ),
  ];
}

export function renderStaffMobileCard(member: StaffMember): ReactNode {
  const status = getStaffStatusDisplay(member.status);

  return (
    <>
      <Flex justify="space-between" gap="8px" mb="8px" align="flex-start">
        <Flex align="center" gap="12px" minW={0}>
          <Avatar
            size="sm"
            name={member.full_name}
            src={member.avatar_url ?? undefined}
          />
          <Flex direction="column" minW={0}>
            <Text fontWeight={700} noOfLines={1}>
              {member.full_name}
              {member.is_you ? ' · You' : ''}
            </Text>
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {getStaffRoleLabel(member.role)} · {member.email}
            </Text>
          </Flex>
        </Flex>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>
      <Text fontSize="12px" color="ink.300">
        {member.status === 'invited'
          ? `Invite expires ${formatStaffDateTime(member.invite_expires_at)}`
          : `Last active ${formatStaffDateTime(member.last_active_at)}`}
      </Text>
    </>
  );
}
