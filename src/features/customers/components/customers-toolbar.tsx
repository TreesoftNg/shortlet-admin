'use client';

import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';
import type { CustomerFilters } from '@/features/customers/utils/customer-filters';

type CustomersToolbarProps = {
  filters: CustomerFilters;
  locations: string[];
  onFiltersChange: (next: Partial<CustomerFilters>) => void;
};

export function CustomersToolbar({
  filters,
  locations,
  onFiltersChange,
}: CustomersToolbarProps) {
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
          placeholder="Search name, email, phone…"
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
        value={filters.location}
        onChange={(event) => onFiltersChange({ location: event.target.value })}
      >
        <option value="all">All locations</option>
        {locations.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </Select>
    </Flex>
  );
}
