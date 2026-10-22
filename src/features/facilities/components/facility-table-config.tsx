'use client';

import { Button, Flex, Text } from '@chakra-ui/react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { StatusBadge } from '@/shared/components/ui';
import type { Facility } from '../types';

type FacilityActions = {
  canManage: boolean;
  onEdit: (facility: Facility) => void;
  onArchive: (facility: Facility) => void;
  onRestore: (facility: Facility) => void;
  pendingId: string | null;
};

export function getFacilityColumns({
  canManage,
  onEdit,
  onArchive,
  onRestore,
  pendingId,
}: FacilityActions): DataTableColumn<Facility>[] {
  return [
    {
      id: 'name',
      header: 'Facility',
      cell: (row) => (
        <Flex direction="column" minW={0}>
          <Text fontWeight={700} noOfLines={1}>
            {row.name}
          </Text>
          {row.category ? (
            <Text color="ink.300" fontSize="12px" noOfLines={1}>
              {row.category}
            </Text>
          ) : null}
        </Flex>
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: (row) => row.category ?? '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => (
        <StatusBadge tone={row.status === 'active' ? 'ok' : 'mute'}>
          {row.status === 'active' ? 'Active' : 'Archived'}
        </StatusBadge>
      ),
    },
    ...(canManage
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: (row: Facility) => (
              <Flex gap="8px" onClick={(event) => event.stopPropagation()}>
                {row.status === 'active' ? (
                  <>
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => onEdit(row)}
                      isDisabled={pendingId === row.id}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onArchive(row)}
                      isLoading={pendingId === row.id}
                    >
                      Delete
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onRestore(row)}
                    isLoading={pendingId === row.id}
                  >
                    Restore
                  </Button>
                )}
              </Flex>
            ),
          } satisfies DataTableColumn<Facility>,
        ]
      : []),
  ];
}
