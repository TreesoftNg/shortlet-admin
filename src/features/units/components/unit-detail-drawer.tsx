'use client';

import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { LuPencil } from 'react-icons/lu';
import type { UnitListItem } from '@/features/units/utils/unit-filters';
import { getUnitStatusDisplay } from '@/features/units/utils/unit-filters';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';

type UnitDetailDrawerProps = {
  unit: UnitListItem | null;
};

export function UnitDetailDrawer({ unit }: UnitDetailDrawerProps) {
  if (!unit) {
    return (
      <Box
        bg="white"
        border="1px solid"
        borderColor="line.500"
        borderRadius="22px"
        p="24px"
        color="ink.300"
        fontSize="14px"
      >
        Select a unit to see details.
      </Box>
    );
  }

  const status = getUnitStatusDisplay(unit.status);

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="22px"
      overflow="hidden"
      alignSelf="start"
      position={{ xl: 'sticky' }}
      top={{ xl: '28px' }}
    >
      {unit.picture ? (
        <Box
          as="img"
          src={unit.picture}
          alt=""
          w="100%"
          h="150px"
          objectFit="cover"
        />
      ) : null}

      <Box px="22px" py="20px">
        <Flex justify="space-between" align="flex-start" gap="12px">
          <Box minW={0}>
            <Text fontSize="12px" color="ink.300" fontFamily="mono">
              {unit.code}
            </Text>
            <Heading as="h3" fontSize="18px" fontWeight={700} mt="2px">
              {unit.name}
            </Heading>
            <Text color="ink.400" fontSize="13px" mt="4px">
              {unit.property_name} · {unit.property_city}
            </Text>
          </Box>
          <StatusBadge tone={status.tone} flexShrink={0}>
            {status.label}
          </StatusBadge>
        </Flex>

        <SimpleGrid columns={2} gap="10px" mt="16px">
          <StatChip label="Capacity" value={String(unit.capacity)} />
          <StatChip label="Code" value={unit.code} />
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
              label: 'Status',
              value: <StatusBadge tone={status.tone}>{status.label}</StatusBadge>,
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

        <Flex gap="8px" mt="4px" wrap="wrap">
          <Button
            size="sm"
            variant="dark"
            flex="1"
            minW="120px"
            leftIcon={<LuPencil size={14} />}
          >
            Edit unit
          </Button>
          <Button size="sm" variant="soft">
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
