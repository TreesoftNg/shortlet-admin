'use client';

import {
  Box,
  Button,
  Flex,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { useMemo, useState } from 'react';
import { LuExternalLink, LuMail, LuPhone } from 'react-icons/lu';
import { EmptyState, ErrorState, FilterTabs, StatusBadge } from '@/shared/components/ui';
import { useImportedBookings } from '../hooks/use-calendar-sync-queries';
import type { BookingScope, ImportedBooking, UnitCalendarSummary } from '../types';
import {
  bookingsSearchHref,
  countNights,
  describeImportedBookingPhase,
  errorMessage,
  formatGuestParty,
  formatRelativeTime,
  formatStayDate,
  sortImportedBookings,
  todayIsoDate,
} from '../utils/calendar-sync-format';

/** Bookings imported from Hospitable, with guest contact details (admin only). */
export function BookingsTab({ unit }: { unit: UnitCalendarSummary }) {
  const [scope, setScope] = useState<BookingScope>('upcoming');
  const bookings = useImportedBookings(unit.unitId, scope);
  const today = todayIsoDate(unit.timezone);

  const sorted = useMemo(() => {
    if (!bookings.data) return [];
    return sortImportedBookings(bookings.data, scope, today);
  }, [bookings.data, scope, today]);

  const activeCount = sorted.filter((item) => item.status === 'active').length;
  const cancelledCount = sorted.filter((item) => item.status === 'removed').length;

  return (
    <Stack spacing="14px" fontSize="14px">
      <Box>
        <FilterTabs<BookingScope>
          value={scope}
          onChange={setScope}
          items={[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'all', label: 'All' },
          ]}
        />
        <Text fontSize="13px" color="ink.300" mt="-6px" mb="2px">
          {scope === 'upcoming'
            ? 'Future stays still blocking this unit from Hospitable.'
            : 'Every imported stay, including cancelled ones Hospitable released.'}
        </Text>
      </Box>

      {bookings.isPending ? (
        <Flex justify="center" py="32px">
          <Spinner color="brand.500" />
        </Flex>
      ) : bookings.isError ? (
        <ErrorState
          minH="180px"
          message={errorMessage(bookings.error)}
          onRetry={() => void bookings.refetch()}
        />
      ) : sorted.length === 0 ? (
        <EmptyState
          minH="160px"
          title={scope === 'upcoming' ? 'No upcoming bookings' : 'No imported bookings'}
          description={
            unit.feed
              ? scope === 'upcoming'
                ? 'Hospitable has no upcoming stays for this unit.'
                : 'Nothing has been imported for this unit yet.'
              : 'Connect the Hospitable calendar to see bookings.'
          }
        />
      ) : (
        <Stack spacing="10px">
          <Text fontSize="13px" color="ink.300">
            {sorted.length} booking{sorted.length === 1 ? '' : 's'}
            {scope === 'all' && cancelledCount > 0
              ? ` · ${activeCount} active · ${cancelledCount} cancelled`
              : null}
          </Text>
          {sorted.map((booking) => (
            <BookingRow key={booking.id} booking={booking} today={today} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function BookingRow({
  booking,
  today,
}: {
  booking: ImportedBooking;
  today: string;
}) {
  const nights = countNights(booking.startDate, booking.endDate);
  const phase = describeImportedBookingPhase(booking, today);
  const party = formatGuestParty(booking.adults, booking.children);
  const bookingsHref = bookingsSearchHref(booking);

  return (
    <Box border="1px solid" borderColor="line.500" borderRadius="12px" p="14px">
      <Flex justify="space-between" gap="12px" align="flex-start" mb="10px">
        <Box minW={0}>
          <Text fontWeight={700} noOfLines={1}>
            {booking.guestName ?? 'Guest'}
          </Text>
          {booking.reservationCode ? (
            <Text fontSize="12px" fontFamily="mono" color="ink.300" mt="2px">
              {booking.reservationCode}
            </Text>
          ) : null}
        </Box>
        <Flex gap="6px" wrap="wrap" justify="flex-end">
          <StatusBadge tone={phase.tone}>{phase.label}</StatusBadge>
          <StatusBadge tone="info">
            {booking.source === 'hospitable' ? 'Hospitable' : booking.source}
          </StatusBadge>
        </Flex>
      </Flex>

      <Text fontWeight={600} mb="8px">
        {formatStayDate(booking.startDate)} → {formatStayDate(booking.endDate)}
        <Text as="span" color="ink.300" fontWeight={500}>
          {' '}
          · {nights} night{nights === 1 ? '' : 's'}
        </Text>
      </Text>

      <Stack spacing="4px" color="ink.400" fontSize="13px">
        {party ? <Text>{party}</Text> : null}
        {booking.guestEmail ? (
          <Flex as="a" href={`mailto:${booking.guestEmail}`} align="center" gap="6px" color="ink.400">
            <LuMail size={14} />
            <Text wordBreak="break-word">{booking.guestEmail}</Text>
          </Flex>
        ) : null}
        {booking.guestPhone ? (
          <Flex as="a" href={`tel:${booking.guestPhone}`} align="center" gap="6px" color="ink.400">
            <LuPhone size={14} />
            <Text>{booking.guestPhone}</Text>
          </Flex>
        ) : null}
        {booking.status === 'removed' && booking.removedAt ? (
          <Text color="ink.300">
            Released {formatRelativeTime(booking.removedAt)}
          </Text>
        ) : booking.lastSeenAt ? (
          <Text color="ink.300">
            Last seen in feed {formatRelativeTime(booking.lastSeenAt)}
          </Text>
        ) : null}
      </Stack>

      {bookingsHref ? (
        <Button
          as={NextLink}
          href={bookingsHref}
          size="sm"
          variant="soft"
          mt="12px"
          leftIcon={<LuExternalLink size={14} />}
        >
          View in Bookings
        </Button>
      ) : null}
    </Box>
  );
}
