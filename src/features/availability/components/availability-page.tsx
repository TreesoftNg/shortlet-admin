'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Select,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
import { useProperties } from '@/features/properties/hooks/use-properties';
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PageSkeleton,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import type { CalendarRange } from '@/shared/types/hospitable';
import {
  parsePropertyIdFilter,
  propertyIdFilterToInputValue,
  type PropertyIdFilter,
} from '@/shared/utils/property-id';

const DEFAULT_ANCHOR = '2026-09-26';
const TODAY = '2026-09-26';

const RANGE_OPTIONS: Array<{ value: CalendarRange; label: string }> = [
  { value: 'week', label: 'Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: 'month', label: 'Month' },
];

export function AvailabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: properties = [] } = useProperties();
  const [anchorDate, setAnchorDate] = useState(DEFAULT_ANCHOR);
  const [range, setRange] = useState<CalendarRange>('2weeks');
  const [propertyId, setPropertyId] = useState<PropertyIdFilter>('all');
  const [highlightedUnitId, setHighlightedUnitId] = useState<number | null>(
    null,
  );
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  useEffect(() => {
    const propertyParam = searchParams.get('propertyId');
    if (propertyParam) {
      setPropertyId(parsePropertyIdFilter(propertyParam));
    }

    const unitParam = searchParams.get('unitId');
    if (unitParam) {
      const parsed = Number(unitParam);
      setHighlightedUnitId(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
    } else {
      setHighlightedUnitId(null);
    }
  }, [searchParams]);

  const step = range === 'week' ? 7 : range === 'month' ? 30 : 14;

  const { data, isLoading, isError, error, refetch } = useAvailabilityCalendar({
    anchorDate,
    range,
    propertyId,
  });

  const isInitialLoad = isLoading && !data;

  const rangeLabel = useMemo(() => {
    if (!data) return '';
    return formatRangeLabel(data.start_date, data.end_date);
  }, [data]);

  const highlightedUnitName = useMemo(() => {
    if (!highlightedUnitId || !data) return null;
    return data.units.find((unit) => unit.id === highlightedUnitId)?.name ?? null;
  }, [data, highlightedUnitId]);

  const updatePropertyId = (next: PropertyIdFilter) => {
    setPropertyId(next);
    setHighlightedUnitId(null);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') {
      params.delete('propertyId');
    } else {
      params.set('propertyId', String(next));
    }
    params.delete('unitId');
    const query = params.toString();
    router.replace(query ? `/availability?${query}` : '/availability', {
      scroll: false,
    });
  };

  if (isInitialLoad) {
    return (
      <Box>
        <PageHeader
          title="Availability"
          description="Every unit, every night — bookings, holds and blocks in one view."
        />
        <PageSkeleton variant="calendar" />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Availability"
        description={
          highlightedUnitName
            ? `Focused on ${highlightedUnitName}.`
            : 'Every unit, every night — bookings, holds and blocks in one view.'
        }
        actions={
          <IconButton
            aria-label="Open navigation"
            icon={<LuMenu size={20} />}
            display={{ base: 'inline-flex', lg: 'none' }}
            variant="secondary"
            borderRadius="12px"
            h="44px"
            w="44px"
            onClick={openMobileNav}
          />
        }
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
          <Flex gap="8px" align="center" wrap="wrap">
            <IconButton
              aria-label="Previous range"
              icon={<LuChevronLeft size={18} />}
              variant="secondary"
              borderRadius="10px"
              h="36px"
              w="36px"
              onClick={() => setAnchorDate((current) => addDays(current, -step))}
            />
            <IconButton
              aria-label="Next range"
              icon={<LuChevronRight size={18} />}
              variant="secondary"
              borderRadius="10px"
              h="36px"
              w="36px"
              onClick={() => setAnchorDate((current) => addDays(current, step))}
            />
            <Text fontWeight={700} fontSize="14px" minW="160px">
              {rangeLabel || 'Loading range…'}
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
            <IconButton
              aria-label="Refresh calendar"
              icon={<LuRefreshCw size={16} />}
              variant="secondary"
              borderRadius="10px"
              h="36px"
              w="36px"
              onClick={() => void refetch()}
            />
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
              value={propertyIdFilterToInputValue(propertyId)}
              onChange={(event) =>
                updatePropertyId(parsePropertyIdFilter(event.target.value))
              }
            >
              <option value="all">All properties</option>
              {properties.map((property) => (
                <option key={property.id} value={String(property.id)}>
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
          <Box px="20px" pb="20px">
            <Skeleton h="360px" borderRadius="14px" />
          </Box>
        ) : isError || !data ? (
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Failed to load availability calendar'
            }
            onRetry={() => void refetch()}
          />
        ) : data.units.length === 0 ? (
          <EmptyState
            title="No units to show"
            description="There are no units in this calendar view for the selected property and date range."
            icon={<LuBan size={24} />}
          />
        ) : (
          <AvailabilityCalendarGrid
            data={data}
            highlightedUnitId={highlightedUnitId}
          />
        )}
      </Box>
    </Box>
  );
}
