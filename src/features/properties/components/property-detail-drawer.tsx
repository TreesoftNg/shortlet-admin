'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { LuPencil } from 'react-icons/lu';
import type { PropertyListItem } from '@/features/properties/components/property-table-config';
import {
  formatCapacity,
  formatPropertyType,
} from '@/features/properties/utils/property-filters';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';

type PropertyDetailDrawerProps = {
  property: PropertyListItem | null;
  onEdit?: () => void;
};

export function PropertyDetailDrawer({
  property,
  onEdit,
}: PropertyDetailDrawerProps) {
  if (!property) {
    return null;
  }

  return (
    <Box overflow="hidden">
      {property.picture ? (
        <Box
          as="img"
          src={property.picture}
          alt=""
          w="100%"
          h="160px"
          objectFit="cover"
          borderRadius="12px"
          mb="16px"
        />
      ) : null}

      <Box>
        <Flex justify="space-between" align="flex-start" gap="12px">
          <Box minW={0}>
            <Text fontSize="12px" color="ink.300" textTransform="uppercase" letterSpacing="0.04em">
              {formatPropertyType(property)}
            </Text>
            <Heading as="h3" fontSize="18px" fontWeight={700} mt="2px">
              {property.name}
            </Heading>
            <Text color="ink.400" fontSize="13px" mt="4px">
              {property.address.display}
            </Text>
          </Box>
          <StatusBadge tone={property.listed ? 'ok' : 'mute'} flexShrink={0}>
            {property.listed ? 'Listed' : 'Unlisted'}
          </StatusBadge>
        </Flex>

        {property.summary ? (
          <Text mt="14px" fontSize="14px" color="ink.400">
            {property.summary}
          </Text>
        ) : null}

        <SimpleGrid columns={2} gap="10px" mt="16px">
          <StatChip label="Units" value={String(property.unit_count)} />
          <StatChip label="Guests" value={String(property.capacity.max)} />
          <StatChip label="Bedrooms" value={String(property.capacity.bedrooms)} />
          <StatChip label="Bathrooms" value={String(property.capacity.bathrooms)} />
        </SimpleGrid>

        <KeyValueList
          title="Operations"
          items={[
            {
              label: 'Check-in',
              value: <Text as="b">{property.check_in ?? '—'}</Text>,
            },
            {
              label: 'Checkout',
              value: <Text as="b">{property.check_out ?? '—'}</Text>,
            },
            {
              label: 'Timezone',
              value: <Text as="b">{property.timezone}</Text>,
            },
            {
              label: 'Currency',
              value: <Text as="b">{property.currency}</Text>,
            },
            {
              label: 'Capacity',
              value: <Text as="b">{formatCapacity(property)}</Text>,
            },
          ]}
        />

        <Box py="16px" borderTop="1px solid" borderColor="line.500">
          <Text
            fontSize="12px"
            textTransform="uppercase"
            letterSpacing="0.05em"
            color="ink.300"
            fontWeight={700}
            mb="10px"
          >
            Amenities
          </Text>
          <Wrap spacing="8px">
            {property.amenities.map((amenity) => (
              <WrapItem key={amenity}>
                <StatusBadge tone="mute">
                  {amenity.replace(/_/g, ' ')}
                </StatusBadge>
              </WrapItem>
            ))}
          </Wrap>
        </Box>

        <Box py="16px" borderTop="1px solid" borderColor="line.500">
          <Text
            fontSize="12px"
            textTransform="uppercase"
            letterSpacing="0.05em"
            color="ink.300"
            fontWeight={700}
            mb="10px"
          >
            Channels
          </Text>
          {property.listings && property.listings.length > 0 ? (
            property.listings.map((listing) => (
              <Flex
                key={listing.id}
                justify="space-between"
                align="center"
                fontSize="14px"
                mb="8px"
              >
                <Text textTransform="capitalize">{listing.channel}</Text>
                <StatusBadge tone={listing.active ? 'ok' : 'mute'}>
                  {listing.active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </Flex>
            ))
          ) : (
            <Text fontSize="14px" color="ink.300">
              Direct bookings only
            </Text>
          )}
        </Box>

        <Flex gap="8px" mt="4px" wrap="wrap">
          <Button
            size="sm"
            variant="dark"
            flex="1"
            minW="120px"
            leftIcon={<LuPencil size={14} />}
            onClick={onEdit}
            isDisabled={!onEdit}
          >
            Edit property
          </Button>
          <Button size="sm" variant="soft">
            Manage units
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="12px" px="12px" py="10px">
      <Text fontSize="11px" color="ink.300" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="18px" fontWeight={800} mt="2px">
        {value}
      </Text>
    </Box>
  );
}
