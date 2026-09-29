'use client';

import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { LuBuilding2, LuFilter, LuSearch } from 'react-icons/lu';
import type { BookingFilters } from '@/features/bookings/utils/booking-filters';
import { FilterChip } from '@/shared/components/ui';
import type { Property } from '@/shared/types/hospitable';

type BookingsToolbarProps = {
  filters: BookingFilters;
  properties: Property[];
  onFiltersChange: (next: Partial<BookingFilters>) => void;
};

export function BookingsToolbar({
  filters,
  properties,
  onFiltersChange,
}: BookingsToolbarProps) {
  return (
    <Flex gap="10px" mb="14px" wrap="wrap" align="center">
      <InputGroup flex="1" minW={{ base: '100%', md: '220px' }}>
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
          placeholder="Reference, guest, email…"
          value={filters.search}
          onChange={(event) =>
            onFiltersChange({ search: event.target.value, page: 1 })
          }
        />
      </InputGroup>

      <Flex
        as="label"
        align="center"
        gap="6px"
        h="40px"
        px="14px"
        border="1px solid"
        borderColor="line.500"
        borderRadius="10px"
        bg="white"
        color="ink.400"
        fontSize="13px"
        fontWeight={600}
        flexShrink={0}
      >
        <LuBuilding2 size={16} />
        <Select
          variant="unstyled p-6"
          h="auto"
          fontSize="13px"
          fontWeight={600}
          value={filters.propertyId}
          onChange={(event) =>
            onFiltersChange({
              propertyId: event.target.value,
              page: 1,
            })
          }
          w="auto"
          minW="120px"
        >
          <option value="all">All properties</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </Select>
      </Flex>

    </Flex>
  );
}
