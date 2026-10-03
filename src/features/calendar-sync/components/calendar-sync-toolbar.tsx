'use client';

import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { LuRefreshCw, LuSearch } from 'react-icons/lu';
import type { CalendarSyncFilters } from '../utils/calendar-sync-filters';

type CalendarSyncToolbarProps = {
  filters: CalendarSyncFilters;
  syncableCount: number;
  isSyncingAll: boolean;
  onFiltersChange: (next: Partial<CalendarSyncFilters>) => void;
  onSyncAll: () => void;
};

export function CalendarSyncToolbar({
  filters,
  syncableCount,
  isSyncingAll,
  onFiltersChange,
  onSyncAll,
}: CalendarSyncToolbarProps) {
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
          placeholder="Search units…"
          value={filters.search}
          onChange={(event) => onFiltersChange({ search: event.target.value })}
        />
      </InputGroup>

      <Button
        h="40px"
        borderRadius="12px"
        variant="secondary"
        leftIcon={<LuRefreshCw size={16} />}
        onClick={onSyncAll}
        isLoading={isSyncingAll}
        loadingText="Syncing"
        isDisabled={syncableCount === 0}
      >
        Sync all connected ({syncableCount})
      </Button>
    </Flex>
  );
}
