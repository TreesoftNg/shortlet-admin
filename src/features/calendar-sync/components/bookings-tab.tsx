'use client';

import { Box, Flex, Spinner, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { EmptyState, ErrorState, FilterTabs, StatusBadge } from '@/shared/components/ui';
import { useImportedBookings } from '../hooks/use-calendar-sync-queries';
import type { BookingScope, ImportedBooking, UnitCalendarSummary } from '../types';
import { countNights, errorMessage, formatStayDate } from '../utils/calendar-sync-format';

/** Bookings imported from Hospitable, with guest contact details (admin only). */
export function BookingsTab({ unit }: { unit: UnitCalendarSummary }) {
  const [scope, setScope] = useState<BookingScope>('upcoming');
  const bookings = useImportedBookings(unit.unitId, scope);

  return (
    <Stack spacing="14px" fontSize="14px">
      <FilterTabs<BookingScope>
        value={scope}
        onChange={setScope}
        items={[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'all', label: 'All, including cancelled' },
        ]}
      />
      {bookings.isPending ? (
        <Flex justify="center" py="32px">
          <Spinner color="brand.500" />
        </Flex>
      ) : bookings.isError ? (
        <ErrorState minH="180px" message={errorMessage(bookings.error)} onRetry={() => void bookings.refetch()} />
      ) : bookings.data.length === 0 ? (
        <EmptyState
          minH="160px"
          title="No bookings"
          description={
            unit.feed ? 'Hospitable has no bookings for this unit yet.' : 'Connect the Hospitable calendar to see bookings.'
          }
        />
      ) : (
        <Stack spacing="8px">
          {bookings.data.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function BookingRow({ booking }: { booking: ImportedBooking }) {
  const nights = countNights(booking.startDate, booking.endDate);
  const guests = [
    booking.adults ? `${booking.adults} adult${booking.adults === 1 ? '' : 's'}` : null,
    booking.children ? `${booking.children} child${booking.children === 1 ? '' : 'ren'}` : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Box border="1px solid" borderColor="line.500" borderRadius="12px" p="12px 14px">
      <Flex justify="space-between" gap="12px" align="flex-start">
        <Box minW={0}>
          <Text fontWeight={700}>
            {booking.guestName ?? 'Guest'}
            {booking.reservationCode ? (
              <Text as="span" color="ink.300" fontWeight={500}>
                {' '}
                · {booking.reservationCode}
              </Text>
            ) : null}
          </Text>
          <Text color="ink.400">
            {formatStayDate(booking.startDate)} → {formatStayDate(booking.endDate)} · {nights} night
            {nights === 1 ? '' : 's'}
          </Text>
          {guests || booking.guestEmail || booking.guestPhone ? (
            <Text color="ink.300" fontSize="13px" wordBreak="break-word">
              {[guests, booking.guestEmail, booking.guestPhone].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
        </Box>
        {booking.status === 'removed' ? <StatusBadge tone="mute">Cancelled</StatusBadge> : null}
      </Flex>
    </Box>
  );
}
