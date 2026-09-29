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
import type { UnitListItem } from '@/features/units/utils/unit-filters';
import { getUnitStatusDisplay } from '@/features/units/utils/unit-filters';
import { formatUnitSubtitle } from '@/features/units/utils/unit-form';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';

type UnitDetailDrawerProps = {
  unit: UnitListItem | null;
  onEdit?: () => void;
  onAvailability?: () => void;
};

export function UnitDetailDrawer({
  unit,
  onEdit,
  onAvailability,
}: UnitDetailDrawerProps) {
  if (!unit) {
    return null;
  }

  const status = getUnitStatusDisplay(unit.status);
  const rateLabel =
    unit.base_rate === null
      ? 'Inherits property'
      : new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: unit.property_currency,
          maximumFractionDigits: 0,
        }).format(unit.base_rate);

  return (
    <Box overflow="hidden">
      {unit.picture ? (
        <Box
          as="img"
          src={unit.picture}
          alt=""
          w="100%"
          h="150px"
          objectFit="cover"
          borderRadius="12px"
          mb="16px"
        />
      ) : null}

      <Box>
        <Flex justify="space-between" align="flex-start" gap="12px">
          <Box minW={0}>
            <Text fontSize="12px" color="ink.300" fontFamily="mono">
              {unit.code}
            </Text>
            <Heading as="h3" fontSize="18px" fontWeight={700} mt="2px">
              {unit.name}
            </Heading>
            <Text color="ink.400" fontSize="13px" mt="4px">
              {unit.property_name} · {formatUnitSubtitle(unit)}
            </Text>
          </Box>
          <Flex direction="column" gap="6px" align="flex-end">
            <StatusBadge tone={status.tone} flexShrink={0}>
              {status.label}
            </StatusBadge>
            <StatusBadge tone={unit.bookable ? 'ok' : 'mute'} flexShrink={0}>
              {unit.bookable ? 'Bookable' : 'Closed'}
            </StatusBadge>
          </Flex>
        </Flex>

        {unit.summary ? (
          <Text mt="14px" fontSize="14px" color="ink.400">
            {unit.summary}
          </Text>
        ) : null}

        <SimpleGrid columns={2} gap="10px" mt="16px">
          <StatChip label="Guests" value={String(unit.capacity)} />
          <StatChip label="Bedrooms" value={String(unit.bedrooms)} />
          <StatChip label="Beds" value={String(unit.beds)} />
          <StatChip label="Baths" value={String(unit.bathrooms)} />
        </SimpleGrid>

        <KeyValueList
          title="Details"
          items={[
            {
              label: 'Property',
              value: <Text as="b">{unit.property_name}</Text>,
            },
            {
              label: 'City',
              value: <Text as="b">{unit.property_city}</Text>,
            },
            {
              label: 'Floor',
              value: <Text as="b">{unit.floor ?? '—'}</Text>,
            },
            {
              label: 'Base rate',
              value: <Text as="b">{rateLabel}</Text>,
            },
            {
              label: 'Updated',
              value: (
                <Text as="b">
                  {new Date(unit.updated_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              ),
            },
          ]}
        />

        {unit.property_amenities.length > 0 ? (
          <Box py="16px" borderTop="1px solid" borderColor="line.500">
            <Text
              fontSize="12px"
              textTransform="uppercase"
              letterSpacing="0.05em"
              color="ink.300"
              fontWeight={700}
              mb="10px"
            >
              Amenities (from property)
            </Text>
            <Wrap spacing="8px">
              {unit.property_amenities.map((amenity) => (
                <WrapItem key={amenity}>
                  <StatusBadge tone="mute">
                    {amenity.replace(/_/g, ' ')}
                  </StatusBadge>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        ) : null}

        {unit.notes ? (
          <Box py="16px" borderTop="1px solid" borderColor="line.500">
            <Text
              fontSize="12px"
              textTransform="uppercase"
              letterSpacing="0.05em"
              color="ink.300"
              fontWeight={700}
              mb="8px"
            >
              Internal notes
            </Text>
            <Text fontSize="14px" color="ink.400">
              {unit.notes}
            </Text>
          </Box>
        ) : null}

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
            Edit unit
          </Button>
          <Button
            size="sm"
            variant="soft"
            onClick={onAvailability}
            isDisabled={!onAvailability}
          >
            Availability
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.400" borderRadius="12px" px="12px" py="10px">
      <Text
        fontSize="11px"
        color="ink.300"
        fontWeight={700}
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="18px" fontWeight={800} mt="2px">
        {value}
      </Text>
    </Box>
  );
}
