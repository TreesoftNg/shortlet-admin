'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Select,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import {
  LuBan,
  LuChevronLeft,
  LuChevronRight,
  LuMenu,
  LuRefreshCw,
} from 'react-icons/lu';
import { AvailabilityCalendarGrid } from '@/features/availability/components/availability-calendar-grid';
import { CalendarLegend } from '@/features/availability/components/calendar-legend';
import { useAvailabilityCalendar } from '@/features/availability/hooks/use-availability-calendar';
import {
  addDays,
  formatRangeLabel,
} from '@/features/availability/utils/calendar';
import { mockProperties } from '@/mocks/data';
import { PageHeader } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import type { CalendarRange } from '@/shared/types/hospitable';

const DEFAULT_ANCHOR = '2026-09-26';
const TODAY = '2026-09-26';

const RANGE_OPTIONS: Array<{ value: CalendarRange; label: string }> = [
  { value: 'week', label: 'Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: 'month', label: 'Month' },
];

export function AvailabilityPage() {
  const [anchorDate, setAnchorDate] = useState(DEFAULT_ANCHOR);
  const [range, setRange] = useState<CalendarRange>('2weeks');
  const [propertyId, setPropertyId] = useState<string | 'all'>('all');
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const step = range === 'week' ? 7 : range === 'month' ? 30 : 14;

  const { data, isLoading, isError, error } = useAvailabilityCalendar({
    anchorDate,
    range,
    propertyId,
  });

  const rangeLabel = useMemo(() => {
    if (!data) return '';
    return formatRangeLabel(data.start_date, data.end_date);
  }, [data]);

  return (
    <Box>
      <PageHeader
        title="Availability"
        description="Every unit, every night — bookings, holds and blocks in one view."
      />

      <Box
        bg="white"
        border="1px solid"
        borderColor="line.500"
        borderRadius="22px"
        overflow="hidden"
      >
        <Flex
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="12px"
          px="20px"
          py="16px"
          borderBottom="1px solid"
          borderColor="line.500"
        >
          <Flex align="center" gap="10px" wrap="wrap">
            <IconButton
              aria-label="Previous range"
              icon={<LuChevronLeft size={16} />}
              w="36px"
              h="36px"
              minW="36px"
              variant="secondary"
              borderRadius="12px"
              onClick={() => setAnchorDate((current) => addDays(current, -step))}
            />
            <IconButton
              aria-label="Next range"
              icon={<LuChevronRight size={16} />}
              w="36px"
              h="36px"
              minW="36px"
              variant="secondary"
              borderRadius="12px"
              onClick={() => setAnchorDate((current) => addDays(current, step))}
            />
            <Text fontSize="17px" fontWeight={700} ml={{ base: 0, sm: '6px' }}>
              {rangeLabel || 'Loading…'}
            </Text>
            <Button
              h="32px"
              px="12px"
              borderRadius="full"
              variant="secondary"
              fontSize="13px"
              fontWeight={600}
              onClick={() => setAnchorDate(TODAY)}
            >
              Today
            </Button>
          </Flex>

          <Flex gap="8px" wrap="wrap" align="center">
            <Select
              h="36px"
              maxW="180px"
              borderColor="line.500"
              borderRadius="999px"
              bg="white"
              fontSize="13px"
              fontWeight={600}
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
            >
              <option value="all">All properties</option>
              {mockProperties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </Select>

            <Flex bg="bg.400" borderRadius="10px" p="3px" gap="2px">
              {RANGE_OPTIONS.map((option) => {
                const active = option.value === range;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    h="auto"
                    minW="auto"
                    px="12px"
                    py="6px"
                    borderRadius="8px"
                    fontSize="13px"
                    fontWeight={700}
                    variant="unstyled"
                    bg={active ? 'white' : 'transparent'}
                    color={active ? 'ink.500' : 'ink.300'}
                    boxShadow={active ? '0 1px 2px rgba(0,0,0,.08)' : 'none'}
                    onClick={() => setRange(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </Flex>
          </Flex>
        </Flex>

        <CalendarLegend />

        {isLoading ? (
          <Flex minH="280px" align="center" justify="center">
            <Spinner color="brand.500" />
          </Flex>
        ) : isError || !data ? (
          <Box p="24px">
            <Text color="status.danger">
              {error instanceof Error
                ? error.message
                : 'Failed to load availability calendar'}
            </Text>
          </Box>
        ) : (
          <AvailabilityCalendarGrid data={data} />
        )}
      </Box>
    </Box>
  );
}
