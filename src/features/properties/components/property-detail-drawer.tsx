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
  useToast,
} from '@chakra-ui/react';
import { LuPencil } from 'react-icons/lu';
import type { PropertyListItem } from '@/features/properties/components/property-table-config';
import {
  useArchiveProperty,
  useRestoreProperty,
} from '@/features/properties/hooks/use-property-mutations';
import {
  formatCapacity,
  formatPropertyType,
} from '@/features/properties/utils/property-filters';
import { StatusBadge } from '@/shared/components/ui';

type PropertyDetailDrawerProps = {
  property: PropertyListItem | null;
  onEdit?: () => void;
  onManageUnits?: () => void;
  onArchivedOrRestored?: () => void;
};

export function PropertyDetailDrawer({
  property,
  onEdit,
  onManageUnits,
  onArchivedOrRestored,
}: PropertyDetailDrawerProps) {
  const toast = useToast();
  const archive = useArchiveProperty();
  const restore = useRestoreProperty();

  if (!property) {
    return null;
  }

  const handleArchive = async () => {
    if (
      !window.confirm(
        `Archive ${property.name}? Active units must be archived first.`,
      )
    ) {
      return;
    }
    try {
      await archive.mutateAsync(property.id);
      toast({ title: 'Property archived', status: 'success', duration: 2500 });
      onArchivedOrRestored?.();
    } catch (error) {
      toast({
        title: 'Could not archive property',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleRestore = async () => {
    try {
      await restore.mutateAsync(property.id);
      toast({ title: 'Property restored', status: 'success', duration: 2500 });
      onArchivedOrRestored?.();
    } catch (error) {
      toast({
        title: 'Could not restore property',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="stretch"
        gap={{ base: '20px', lg: '28px' }}
      >
        {property.picture ? (
          <Box
            as="img"
            src={property.picture}
            alt=""
            w={{ base: '100%', lg: '42%' }}
            minH={{ base: '220px', lg: '320px' }}
            h={{ base: '220px', lg: 'auto' }}
            maxH={{ lg: '420px' }}
            objectFit="cover"
            borderRadius="16px"
            flexShrink={0}
          />
        ) : null}

        <Box flex="1" minW={0}>
          <Flex justify="space-between" align="flex-start" gap="12px">
            <Box minW={0}>
              <Text
                fontSize="13px"
                color="ink.300"
                textTransform="uppercase"
                letterSpacing="0.04em"
              >
                {formatPropertyType(property)}
              </Text>
              <Heading
                as="h3"
                fontSize={{ base: '22px', md: '26px' }}
                fontWeight={800}
                letterSpacing="-0.02em"
                mt="4px"
              >
                {property.name}
              </Heading>
              <Text color="ink.400" fontSize="15px" mt="6px">
                {property.address.display}
              </Text>
            </Box>
            <StatusBadge
              tone={property.archived ? 'mute' : property.listed ? 'ok' : 'mute'}
              flexShrink={0}
            >
              {property.archived
                ? 'Archived'
                : property.listed
                  ? 'Listed'
                  : 'Unlisted'}
            </StatusBadge>
          </Flex>

          {property.summary ? (
            <Text mt="16px" fontSize="15px" color="ink.400" lineHeight="1.6">
              {property.summary}
            </Text>
          ) : null}

          <SimpleGrid columns={{ base: 2, md: 4 }} gap="12px" mt="20px">
            <StatChip label="Units" value={String(property.unit_count)} />
            <StatChip label="Guests" value={String(property.capacity.max)} />
            <StatChip label="Bedrooms" value={String(property.capacity.bedrooms)} />
            <StatChip label="Bathrooms" value={String(property.capacity.bathrooms)} />
          </SimpleGrid>
        </Box>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="14px" mt="24px">
        <DetailCard label="Check-in" value={property.check_in ?? '—'} />
        <DetailCard label="Checkout" value={property.check_out ?? '—'} />
        <DetailCard label="Timezone" value={property.timezone} />
        <DetailCard label="Currency" value={property.currency} />
        <DetailCard label="Capacity" value={formatCapacity(property)} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="24px" mt="24px">
        <Box>
          <SectionLabel>Facilities</SectionLabel>
          {property.amenities.length > 0 ? (
            <Wrap spacing="8px">
              {property.amenities.map((amenity) => (
                <WrapItem key={amenity}>
                  <StatusBadge tone="mute">{amenity}</StatusBadge>
                </WrapItem>
              ))}
            </Wrap>
          ) : (
            <Text fontSize="15px" color="ink.300">
              No facilities assigned
            </Text>
          )}
        </Box>

        <Box>
          <SectionLabel>Channels</SectionLabel>
          {property.listings && property.listings.length > 0 ? (
            property.listings.map((listing) => (
              <Flex
                key={listing.id}
                justify="space-between"
                align="center"
                fontSize="15px"
                mb="10px"
              >
                <Text textTransform="capitalize">{listing.channel}</Text>
                <StatusBadge tone={listing.active ? 'ok' : 'mute'}>
                  {listing.active ? 'Active' : 'Inactive'}
                </StatusBadge>
              </Flex>
            ))
          ) : (
            <Text fontSize="15px" color="ink.300">
              Direct bookings only
            </Text>
          )}
        </Box>
      </SimpleGrid>

      <Flex gap="10px" mt="28px" wrap="wrap">
        {!property.archived ? (
          <Button
            variant="dark"
            flex="1"
            minW="160px"
            leftIcon={<LuPencil size={16} />}
            onClick={onEdit}
            isDisabled={!onEdit}
          >
            Edit property
          </Button>
        ) : null}
        <Button
          variant="soft"
          minW="140px"
          onClick={onManageUnits}
          isDisabled={!onManageUnits || property.archived}
        >
          Manage units
        </Button>
        {property.archived ? (
          <Button
            variant="secondary"
            minW="140px"
            onClick={() => void handleRestore()}
            isLoading={restore.isPending}
          >
            Restore
          </Button>
        ) : (
          <Button
            variant="secondary"
            minW="140px"
            onClick={() => void handleArchive()}
            isLoading={archive.isPending}
          >
            Archive
          </Button>
        )}
      </Flex>
    </Box>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="12px"
      textTransform="uppercase"
      letterSpacing="0.05em"
      color="ink.300"
      fontWeight={700}
      mb="10px"
    >
      {children}
    </Text>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="14px" px="16px" py="14px">
      <Text fontSize="11px" color="ink.300" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="16px" fontWeight={700} mt="4px">
        {value}
      </Text>
    </Box>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="14px" px="16px" py="14px">
      <Text fontSize="11px" color="ink.300" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="22px" fontWeight={800} mt="4px">
        {value}
      </Text>
    </Box>
  );
}
