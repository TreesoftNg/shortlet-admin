'use client';

import { Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { timestampColumns } from '@/shared/components/ui/timestamp-columns';
import { PropertyCell, StatusBadge } from '@/shared/components/ui';
import type { UnitListItem } from '../utils/unit-filters';
import { getUnitStatusDisplay } from '../utils/unit-filters';
import { formatUnitSubtitle } from '../utils/unit-form';

export function getUnitColumns(): DataTableColumn<UnitListItem>[] {
  return [
    {
      id: 'unit',
      header: 'Unit',
      cell: (row) => (
        <PropertyCell
          name={row.name}
          subtitle={formatUnitSubtitle(row)}
          imageUrl={row.picture}
        />
      ),
    },
    {
      id: 'property',
      header: 'Property',
      cell: (row) => (
        <Flex direction="column">
          <Text fontWeight={700}>{row.property_name}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.property_city}
          </Text>
        </Flex>
      ),
    },
    {
      id: 'capacity',
      header: 'Capacity',
      meta: { fontWeight: 700 },
      cell: (row) => `${row.capacity} guests`,
    },
    {
      id: 'rate',
      header: 'Base rate',
      cell: (row) =>
        row.base_rate === null
          ? '—'
          : new Intl.NumberFormat('en-NG', {
              style: 'currency',
              currency: row.property_currency,
              maximumFractionDigits: 0,
            }).format(row.base_rate),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const status = getUnitStatusDisplay(row.status);
        return (
          <Flex direction="column" gap="4px" align="flex-start">
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            {!row.bookable ? (
              <StatusBadge tone="mute">Closed</StatusBadge>
            ) : null}
          </Flex>
        );
      },
    },
    ...timestampColumns<UnitListItem>(
      (row) => row.created_at,
      (row) => row.updated_at,
    ),
  ];
}

export function renderUnitMobileCard(unit: UnitListItem): ReactNode {
  const status = getUnitStatusDisplay(unit.status);

  return (
    <>
      <Flex justify="space-between" gap="8px" mb="10px" align="flex-start">
        <PropertyCell
          name={unit.name}
          subtitle={unit.property_name}
          imageUrl={unit.picture}
        />
        <StatusBadge tone={status.tone} flexShrink={0}>
          {status.label}
        </StatusBadge>
      </Flex>
      <Text fontSize="13px" color="ink.400">
        {formatUnitSubtitle(unit)} · Sleeps {unit.capacity} ·{' '}
        {unit.property_city}
      </Text>
    </>
  );
}
