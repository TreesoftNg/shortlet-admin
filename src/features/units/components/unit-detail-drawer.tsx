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
import { useRouter } from 'next/navigation';
import { LuPencil } from 'react-icons/lu';
import { useUnitMedia } from '@/features/unit-media/hooks/use-unit-media';
import type { UnitListItem } from '@/features/units/utils/unit-filters';
import { getUnitStatusDisplay } from '@/features/units/utils/unit-filters';
import { formatUnitSubtitle } from '@/features/units/utils/unit-form';
import { StatusBadge } from '@/shared/components/ui';

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
  const router = useRouter();
  const { data: media = [], isLoading: mediaLoading } = useUnitMedia(unit?.id);
  const thumbs = media.slice(0, 5);

  if (!unit) {
    return null;
  }

  const status = getUnitStatusDisplay(unit.status);
  const money = (amount: number | null) =>
    amount === null
      ? '—'
      : new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: unit.property_currency,
          maximumFractionDigits: 0,
        }).format(amount);

  return (
    <Box>
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        align="stretch"
        gap={{ base: '20px', lg: '28px' }}
      >
        {unit.picture ? (
          <Box
            as="img"
            src={unit.picture}
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
              <Text fontSize="13px" color="ink.300" fontFamily="mono">
                {unit.code || '—'}
              </Text>
              <Heading
                as="h3"
                fontSize={{ base: '22px', md: '26px' }}
                fontWeight={800}
                letterSpacing="-0.02em"
                mt="4px"
              >
                {unit.name}
              </Heading>
              <Text color="ink.400" fontSize="15px" mt="6px">
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
            <Text mt="16px" fontSize="15px" color="ink.400" lineHeight="1.6">
              {unit.summary}
            </Text>
          ) : null}

          <SimpleGrid columns={{ base: 2, md: 4 }} gap="12px" mt="20px">
            <StatChip label="Guests" value={String(unit.capacity)} />
            <StatChip label="Bedrooms" value={String(unit.bedrooms)} />
            <StatChip label="Beds" value={String(unit.beds)} />
            <StatChip label="Baths" value={String(unit.bathrooms)} />
          </SimpleGrid>
        </Box>
      </Flex>

      <Box mt="24px">
        <Flex justify="space-between" align="center" mb="10px">
          <SectionLabel>Gallery</SectionLabel>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/units/${unit.id}/edit?tab=gallery`)}
          >
            Manage gallery
          </Button>
        </Flex>
        {mediaLoading ? (
          <Text fontSize="14px" color="ink.300">
            Loading gallery…
          </Text>
        ) : thumbs.length > 0 ? (
          <Flex gap="8px" overflowX="auto">
            {thumbs.map((item) => {
              const src = item.thumbnailUrl ?? item.sizes?.thumb ?? item.url;
              return src ? (
                <Box
                  key={item.id}
                  as="img"
                  src={src}
                  alt={item.altText ?? ''}
                  w="72px"
                  h="72px"
                  objectFit="cover"
                  borderRadius="10px"
                  flexShrink={0}
                />
              ) : (
                <Box
                  key={item.id}
                  w="72px"
                  h="72px"
                  bg="bg.400"
                  borderRadius="10px"
                  flexShrink={0}
                />
              );
            })}
          </Flex>
        ) : (
          <Text fontSize="14px" color="ink.300">
            No gallery photos yet.
          </Text>
        )}
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px" mt="24px">
        <DetailCard label="Property" value={unit.property_name} />
        <DetailCard label="City" value={unit.property_city} />
        <DetailCard label="Floor" value={unit.floor ?? '—'} />
        <DetailCard
          label="Base rate"
          value={unit.base_rate === null ? 'Inherits property' : money(unit.base_rate)}
        />
        <DetailCard label="Cleaning fee" value={money(unit.cleaning_fee)} />
        <DetailCard
          label="Weekly discount"
          value={
            unit.weekly_discount_percent === null
              ? '—'
              : `${unit.weekly_discount_percent}%`
          }
        />
        <DetailCard
          label="Monthly discount"
          value={
            unit.monthly_discount_percent === null
              ? '—'
              : `${unit.monthly_discount_percent}%`
          }
        />
        <DetailCard
          label="Updated"
          value={new Date(unit.updated_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        />
      </SimpleGrid>

      {unit.amenities.length > 0 ? (
        <Box mt="24px">
          <SectionLabel>Facilities</SectionLabel>
          <Wrap spacing="8px">
            {unit.amenities.map((amenity) => (
              <WrapItem key={amenity}>
                <StatusBadge tone="mute">{amenity}</StatusBadge>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      ) : null}

      {unit.property_amenities.length > 0 ? (
        <Box mt="20px">
          <SectionLabel>Property amenities</SectionLabel>
          <Wrap spacing="8px">
            {unit.property_amenities.map((amenity) => (
              <WrapItem key={amenity}>
                <StatusBadge tone="mute">{amenity.replace(/_/g, ' ')}</StatusBadge>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      ) : null}

      {unit.notes ? (
        <Box mt="20px">
          <SectionLabel>Internal notes</SectionLabel>
          <Text fontSize="15px" color="ink.400" lineHeight="1.6">
            {unit.notes}
          </Text>
        </Box>
      ) : null}

      <Flex gap="10px" mt="28px" wrap="wrap">
        <Button
          variant="dark"
          flex="1"
          minW="160px"
          leftIcon={<LuPencil size={16} />}
          onClick={onEdit}
          isDisabled={!onEdit}
        >
          Edit unit
        </Button>
        <Button variant="soft" minW="140px" onClick={onAvailability} isDisabled={!onAvailability}>
          Availability
        </Button>
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
