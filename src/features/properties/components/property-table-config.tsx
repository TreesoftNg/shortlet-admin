'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { PropertyCell, StatusBadge } from '@/shared/components/ui';
import type { Property } from '@/shared/types/hospitable';
import {
  formatCapacity,
  formatPropertyType,
} from '../utils/property-filters';

export type PropertyListItem = Property & {
  unit_count: number;
};

export function getPropertyColumns(): DataTableColumn<PropertyListItem>[] {
  return [
    {
      id: 'property',
      header: 'Property',
      cell: (row) => (
        <PropertyCell
          name={row.name}
          subtitle={row.address.display ?? `${row.address.city}, ${row.address.state}`}
          imageUrl={row.picture}
        />
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: (row) => formatPropertyType(row),
    },
    {
      id: 'units',
      header: 'Units',
      meta: { fontWeight: 700 },
      cell: (row) => row.unit_count,
    },
    {
      id: 'capacity',
      header: 'Capacity',
      cell: (row) => formatCapacity(row),
    },
    {
      id: 'channels',
      header: 'Channels',
      cell: (row) => {
        const channels = row.listings?.map((listing) => listing.channel) ?? [];
        if (channels.length === 0) {
          return <Text color="ink.300">Direct only</Text>;
        }
        return channels
          .map((channel) => channel.charAt(0).toUpperCase() + channel.slice(1))
          .join(', ');
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) =>
        row.archived ? (
          <StatusBadge tone="mute">Archived</StatusBadge>
        ) : (
          <StatusBadge tone={row.listed ? 'ok' : 'mute'}>
            {row.listed ? 'Listed' : 'Unlisted'}
          </StatusBadge>
        ),
    },
  ];
}

export function renderPropertyMobileCard(property: PropertyListItem): ReactNode {
  return (
    <>
      <Flex justify="space-between" gap="8px" mb="10px" align="flex-start">
        <PropertyCell
          name={property.name}
          subtitle={property.address.city}
          imageUrl={property.picture}
        />
        <StatusBadge tone={property.listed ? 'ok' : 'mute'} flexShrink={0}>
          {property.listed ? 'Listed' : 'Unlisted'}
        </StatusBadge>
      </Flex>
      <Text fontSize="13px" color="ink.400" mb="6px">
        {formatPropertyType(property)} · {property.unit_count} units
      </Text>
      <Text fontSize="13px" color="ink.300">
        {formatCapacity(property)}
      </Text>
    </>
  );
}
