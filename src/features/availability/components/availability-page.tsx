'use client';

import { Box, Button, Flex, IconButton, Select, Skeleton, Text, useToast } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { LuBan, LuCalendarPlus, LuChevronLeft, LuChevronRight, LuMenu, LuRefreshCw } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { StaffBookingForm } from '@/features/bookings/live/staff-booking-form';
import { useCalendarUnits } from '@/features/calendar-sync/hooks/use-calendar-sync-queries';
import { formatStayDate } from '@/features/calendar-sync/utils/calendar-sync-format';
import { useSyncAllImportFeeds } from '@/features/calendar-sync/hooks/use-calendar-sync-mutations';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { EmptyState, ErrorState, PageHeader, PageSkeleton } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { parsePropertyIdFilter, propertyIdFilterToInputValue, type PropertyIdFilter } from '@/shared/utils/property-id';
import { useAvailabilityCalendar } from '../hooks/use-availability-calendar';
import type { CalendarEvent, CalendarRange, NightSelection } from '../types';
import { addDays, calendarWindow, formatRangeLabel, RANGE_NIGHTS, todayInLagos } from '../utils/calendar';
import { AvailabilityCalendarGrid } from './availability-calendar-grid';
import { BlockDatesDialog } from './block-dates-dialog';
import { CalendarLegend } from './calendar-legend';
import { EventDetailsModal } from './event-details-modal';

const RANGE_OPTIONS: Array<{ value: CalendarRange; label: string }> = [
  { value: 'week', label: 'Week' },
  { value: '2weeks', label: '2 Weeks' },
  { value: 'month', label: 'Month' },
];

const DESCRIPTION = 'Every unit, every night — bookings, holds and blocks in one view.';

export function AvailabilityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { data: profile } = useMe();
  const { data: properties = [] } = useProperties();
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const [anchorDate, setAnchorDate] = useState(() => todayInLagos());
  const [range, setRange] = useState<CalendarRange>('2weeks');
  const [propertyId, setPropertyId] = useState<PropertyIdFilter>('all');
  const [highlightedUnitId, setHighlightedUnitId] = useState<string | null>(null);
  const [selection, setSelection] = useState<NightSelection | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [dialog, setDialog] = useState<'block' | 'booking' | null>(null);

  const canBlock = hasPermission(profile, 'availability.manage');
  const canBook = hasPermission(profile, 'booking.create');
  const canSync = hasPermission(profile, 'integration.manage');

  useEffect(() => {
    const propertyParam = searchParams.get('propertyId');
    if (propertyParam) setPropertyId(parsePropertyIdFilter(propertyParam));
    setHighlightedUnitId(searchParams.get('unitId')?.trim() || null);
  }, [searchParams]);

  const visibleRange = calendarWindow(anchorDate, range);
  const { data, isLoading, isError, error, refetch, isFetching } = useAvailabilityCalendar({
    ...visibleRange,
    propertyId,
  });

  // Units with a Hospitable feed, for "Sync Hospitable" (needs integration.manage).
  const calendarUnits = useCalendarUnits({ enabled: canSync });
  const syncAll = useSyncAllImportFeeds();
  const syncableUnitIds = (calendarUnits.data ?? []).filter((unit) => unit.feed).map((unit) => unit.unitId);

  const rangeLabel = useMemo(
    () => (data ? formatRangeLabel(data.from, addDays(data.to, -1)) : ''),
    [data],
  );
  const focusedUnit = data?.units.find((unit) => unit.id === highlightedUnitId) ?? null;
  const selectedUnit = data?.units.find((unit) => unit.id === (selection?.unitId ?? selectedEvent?.unitId)) ?? null;

  const updatePropertyId = (next: PropertyIdFilter) => {
    setPropertyId(next);
    setHighlightedUnitId(null);
    setSelection(null);
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('propertyId');
    else params.set('propertyId', next);
    params.delete('unitId');
    params.delete('unitName');
    const query = params.toString();
    router.replace(query ? `/availability?${query}` : '/availability', { scroll: false });
  };

  const move = (days: number) => {
    setSelection(null);
    setAnchorDate((current) => addDays(current, days));
  };

  const syncHospitable = async () => {
    if (!syncableUnitIds.length) {
      toast({ status: 'info', title: 'No units are connected to Hospitable yet.' });
      return;
    }
    const result = await syncAll.mutateAsync(syncableUnitIds);
    toast({
      status: result.failed ? 'warning' : 'success',
      title: result.failed
        ? `Synced ${result.succeeded} of ${result.total} units; ${result.failed} failed.`
        : `Synced ${result.total} units from Hospitable.`,
    });
  };

  if (isLoading && !data) {
    return (
      <Box>
        <PageHeader title="Availability" description={DESCRIPTION} />
        <PageSkeleton variant="calendar" />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Availability"
        description={focusedUnit ? `Focused on ${focusedUnit.name}.` : DESCRIPTION}
        actions={
          <Flex gap="8px" align="center" wrap="wrap">
            {canSync ? (
              <Button
                variant="secondary"
                leftIcon={<LuRefreshCw size={16} />}
                onClick={() => void syncHospitable()}
                isLoading={syncAll.isPending}
              >
                Sync Hospitable
              </Button>
            ) : null}
            {canBlock ? (
              <Button variant="secondary" leftIcon={<LuBan size={16} />} onClick={() => setDialog('block')}>
                Block dates
              </Button>
            ) : null}
            {canBook ? (
              <Button leftIcon={<LuCalendarPlus size={16} />} onClick={() => setDialog('booking')}>
                New booking
              </Button>
            ) : null}
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
          </Flex>
        }
      />

      <Box bg="white" border="1px solid" borderColor="line.500" borderRadius="22px" overflow="hidden">
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
              onClick={() => move(-RANGE_NIGHTS[range])}
            />
            <IconButton
              aria-label="Next range"
              icon={<LuChevronRight size={18} />}
              variant="secondary"
              borderRadius="10px"
              h="36px"
              w="36px"
              onClick={() => move(RANGE_NIGHTS[range])}
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
              onClick={() => {
                setSelection(null);
                setAnchorDate(data?.today ?? todayInLagos());
              }}
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
              isLoading={isFetching}
              onClick={() => void refetch()}
            />
          </Flex>

          <Flex gap="8px" wrap="wrap" align="center">
            <Select
              aria-label="Property"
              h="36px"
              maxW="200px"
              borderColor="line.500"
              borderRadius="999px"
              bg="white"
              fontSize="13px"
              fontWeight={600}
              value={propertyIdFilterToInputValue(propertyId)}
              onChange={(event) => updatePropertyId(parsePropertyIdFilter(event.target.value))}
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
                    aria-pressed={active}
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

        {selection && selectedUnit ? (
          <Flex
            px="20px"
            py="10px"
            gap="10px"
            align="center"
            wrap="wrap"
            bg="brand.50"
            borderBottom="1px solid"
            borderColor="line.500"
            fontSize="14px"
            role="status"
          >
            <Text fontWeight={700}>
              {selectedUnit.name}: {formatStayDate(selection.startDate)} → {formatStayDate(selection.endDate)} (
              {countNights(selection)} {countNights(selection) === 1 ? 'night' : 'nights'})
            </Text>
            <Flex gap="8px" ml={{ md: 'auto' }}>
              {canBlock ? (
                <Button size="sm" variant="secondary" onClick={() => setDialog('block')}>
                  Block these nights
                </Button>
              ) : null}
              {canBook ? (
                <Button size="sm" onClick={() => setDialog('booking')}>
                  Create booking
                </Button>
              ) : null}
              <Button size="sm" variant="ghost" onClick={() => setSelection(null)}>
                Clear
              </Button>
            </Flex>
          </Flex>
        ) : null}

        {isError || !data ? (
          isLoading ? (
            <Box px="20px" pb="20px">
              <Skeleton h="360px" borderRadius="14px" />
            </Box>
          ) : (
            <ErrorState
              message={error instanceof Error ? error.message : 'Failed to load availability calendar'}
              onRetry={() => void refetch()}
            />
          )
        ) : data.units.length === 0 ? (
          <EmptyState
            title="No units to show"
            description="There are no units for the selected property."
            icon={<LuBan size={24} />}
          />
        ) : (
          <AvailabilityCalendarGrid
            data={data}
            highlightedUnitId={highlightedUnitId}
            selection={selection}
            onSelectionChange={canBlock || canBook ? setSelection : undefined}
            onEventClick={setSelectedEvent}
          />
        )}
      </Box>

      {data ? (
        <>
          <BlockDatesDialog
            isOpen={dialog === 'block'}
            onClose={() => setDialog(null)}
            units={data.units}
            today={data.today}
            initial={selection}
            onBlocked={() => setSelection(null)}
          />
          <StaffBookingForm
            isOpen={dialog === 'booking'}
            onClose={() => {
              setDialog(null);
              setSelection(null);
            }}
            units={data.units.filter((unit) => unit.status === 'active')}
            today={data.today}
            initial={selection}
          />
          <EventDetailsModal
            event={selectedEvent}
            unit={selectedUnit}
            onClose={() => setSelectedEvent(null)}
            canManageBlocks={canBlock}
            canRecordPayments={canBook}
          />
        </>
      ) : null}
    </Box>
  );
}

function countNights(selection: NightSelection): number {
  return Math.round(
    (Date.parse(`${selection.endDate}T00:00:00Z`) - Date.parse(`${selection.startDate}T00:00:00Z`)) / 86_400_000,
  );
}
