'use client';

import { Alert, AlertIcon, Box, Text } from '@chakra-ui/react';

type MetricsBasisNoteProps = {
  bookings: number;
  revenue: number;
};

/**
 * Explains occupancy open-nights and zero-revenue bookings (e.g. imported stays).
 */
export function MetricsBasisNote({ bookings, revenue }: MetricsBasisNoteProps) {
  const importedGap = bookings > 0 && revenue === 0;

  return (
    <Alert status="info" borderRadius="12px" fontSize="13px" py="10px" alignItems="flex-start">
      <AlertIcon mt="2px" />
      <Box>
        <Text>
          Occupancy uses each unit&apos;s <strong>open nights</strong> in the period
          (from when it went live, excluding blocked nights)—not always every calendar
          night in the range.
        </Text>
        {importedGap ? (
          <Text mt="6px">
            Bookings can include Airbnb / Booking.com stays that share no price, so
            revenue and avg nightly rate may stay at zero while bookings and nights
            still count.
          </Text>
        ) : null}
      </Box>
    </Alert>
  );
}
