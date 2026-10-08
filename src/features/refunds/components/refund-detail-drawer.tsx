'use client';

import { Box, Button, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import {
  formatMoney,
  formatStayDates,
} from '@/features/bookings/utils/reservation-display';
import type { RefundListItem } from '@/mocks/data/refunds';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import {
  formatRefundDateTime,
  getRefundReasonLabel,
  getRefundStatusDisplay,
} from '../utils/refund-filters';

type RefundDetailDrawerProps = {
  refund: RefundListItem | null;
};

export function RefundDetailDrawer({ refund }: RefundDetailDrawerProps) {
  if (!refund) {
    return null;
  }

  const status = getRefundStatusDisplay(refund.status);
  const reservation = refund.reservation;
  const needsAction =
    refund.status === 'requested' || refund.status === 'pending_approval';

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap="12px" mb="12px">
        <Box minW={0}>
          <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
            {formatMoney(refund.amount, refund.currency)}
          </Heading>
          <Text color="ink.400" fontSize="13px" mt="2px" noOfLines={1}>
            {getRefundReasonLabel(refund.reason)}
          </Text>
        </Box>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>

      {refund.notes ? (
        <Box bg="bg.400" borderRadius="12px" p="12px" mb="8px">
          <Text fontSize="12px" fontWeight={700} color="ink.300" mb="4px">
            Notes
          </Text>
          <Text fontSize="14px">{refund.notes}</Text>
        </Box>
      ) : null}

      <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="40px">
        <Box minW={0}>
          <KeyValueList
            title="Refund"
            items={[
              {
                label: 'Requested by',
                value: <Text as="b">{refund.requested_by}</Text>,
              },
              {
                label: 'Requested',
                value: (
                  <Text as="b">{formatRefundDateTime(refund.created_at)}</Text>
                ),
              },
              {
                label: 'Processed',
                value: (
                  <Text as="b">{formatRefundDateTime(refund.processed_at)}</Text>
                ),
              },
              {
                label: 'Payment',
                value: (
                  <Text as="b">
                    {refund.payment?.reference ?? refund.payment_id}
                  </Text>
                ),
              },
              {
                label: 'Provider',
                value: <Text as="b">Flutterwave</Text>,
              },
            ]}
          />
        </Box>
        <Box minW={0}>
          <KeyValueList
            title="Reservation"
            items={[
              {
                label: 'Booking',
                value: (
                  <Text as="b">
                    {reservation?.platform_id ?? refund.reservation_id}
                  </Text>
                ),
              },
              {
                label: 'Guest',
                value: (
                  <Text as="b">{reservation?.guest?.full_name ?? '—'}</Text>
                ),
              },
              {
                label: 'Property',
                value: (
                  <Text as="b">{reservation?.property?.name ?? '—'}</Text>
                ),
              },
              {
                label: 'Stay',
                value: (
                  <Text as="b">
                    {reservation
                      ? formatStayDates(
                          reservation.arrival_date,
                          reservation.departure_date,
                        )
                      : '—'}
                  </Text>
                ),
              },
            ]}
          />
        </Box>
      </SimpleGrid>

      <Flex gap="8px" mt="12px" wrap="wrap">
        {needsAction ? (
          <>
            <Button size="sm" variant="dark" flex="1" minW="110px">
              Approve
            </Button>
            <Button size="sm" variant="soft">
              Reject
            </Button>
          </>
        ) : null}
        {refund.status === 'processing' ? (
          <Button size="sm" variant="soft" flex="1">
            Check Flutterwave
          </Button>
        ) : null}
        <Button size="sm" variant="soft">
          View payment
        </Button>
      </Flex>
    </Box>
  );
}
