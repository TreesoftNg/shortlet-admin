'use client';

import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import type { PropertyFilters } from '@/features/properties/utils/property-filters';

type PropertiesToolbarProps = {
  filters: PropertyFilters;
  cities: string[];
  onFiltersChange: (next: Partial<PropertyFilters>) => void;
};

export function PropertiesToolbar({
  filters,
  cities,
  onFiltersChange,
}: PropertiesToolbarProps) {
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
          placeholder="Search properties, city, tags…"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
        />
      </InputGroup>

      <Select
        h="40px"
        maxW="180px"
        borderColor="line.500"
        borderRadius="10px"
        bg="white"
        fontSize="13px"
        fontWeight={600}
        color="ink.400"
        value={filters.city}
        onChange={(event) => onFiltersChange({ city: event.target.value })}
      >
        <option value="all">All cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </Select>
    </Flex>
  );
}
