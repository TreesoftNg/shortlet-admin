'use client';

import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import type { UnitFilters } from '@/features/units/utils/unit-filters';
import type { Property } from '@/shared/types/hospitable';
import {
  parsePropertyIdFilter,
  propertyIdFilterToInputValue,
} from '@/shared/utils/property-id';

type UnitsToolbarProps = {
  filters: UnitFilters;
  properties: Property[];
  onFiltersChange: (next: Partial<UnitFilters>) => void;
};

export function UnitsToolbar({
  filters,
  properties,
  onFiltersChange,
}: UnitsToolbarProps) {
  return (
    <Flex gap="10px" mb="14px" wrap="wrap" align="center">
      <InputGroup flex="1" minW={{ base: '100%', md: '240px' }}>
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
          placeholder="Search units, code, property…"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
        />
      </InputGroup>

      <Select
        h="40px"
        maxW="200px"
        borderColor="line.500"
        borderRadius="10px"
        bg="white"
        fontSize="13px"
        fontWeight={600}
        color="ink.400"
        value={propertyIdFilterToInputValue(filters.propertyId)}
        onChange={(event) =>
          onFiltersChange({
            propertyId: parsePropertyIdFilter(event.target.value),
          })
        }
      >
        <option value="all">All properties</option>
        {properties.map((property) => (
          <option key={property.id} value={String(property.id)}>
            {property.name}
          </option>
        ))}
      </Select>
    </Flex>
  );
}
