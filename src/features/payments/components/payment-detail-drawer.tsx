'use client';

import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import {
  formatMoney,
  formatStayDates,
} from '@/features/bookings/utils/reservation-display';
import type { PaymentListItem } from '@/mocks/data/payments';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import {
  formatPaymentDateTime,
  formatProviderLabel,
  getPaymentStatusDisplay,
} from '../utils/payment-filters';

type PaymentDetailDrawerProps = {
  payment: PaymentListItem | null;
};

export function PaymentDetailDrawer({ payment }: PaymentDetailDrawerProps) {
  if (!payment) {
    return (
      <Box
        bg="white"
        border="1px solid"
        borderColor="line.500"
        borderRadius="22px"
        p="24px"
        color="ink.300"
        fontSize="14px"
      >
        Select a payment to view details.
      </Box>
    );
  }

  const status = getPaymentStatusDisplay(payment.status);
  const reservation = payment.reservation;
  const canRefund =
    payment.status === 'SUCCESS' || payment.status === 'PARTIALLY_REFUNDED';
  const canRetry =
    payment.status === 'FAILED' ||
    payment.status === 'PENDING' ||
    payment.status === 'INITIALIZED';

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="22px"
      overflow="hidden"
      alignSelf="start"
      position={{ xl: 'sticky' }}
      top={{ xl: '28px' }}
    >
      <Box px="22px" py="20px">
        <Flex justify="space-between" align="flex-start" gap="12px" mb="12px">
          <Box minW={0}>
            <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
              {formatMoney(payment.amount, payment.currency)}
            </Heading>
            <Text color="ink.400" fontSize="13px" mt="2px" noOfLines={1}>
              {payment.reference}
            </Text>
          </Box>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </Flex>

        <KeyValueList
          title="Payment"
          items={[
            {
              label: 'Provider',
              value: (
                <Text as="b">{formatProviderLabel(payment.provider)}</Text>
              ),
            },
            {
              label: 'Created',
              value: (
                <Text as="b">{formatPaymentDateTime(payment.created_at)}</Text>
              ),
            },
            {
              label: 'Updated',
              value: (
                <Text as="b">{formatPaymentDateTime(payment.updated_at)}</Text>
              ),
            },
            {
              label: 'Currency',
              value: <Text as="b">{payment.currency}</Text>,
            },
          ]}
        />

        <KeyValueList
          title="Reservation"
          items={[
            {
              label: 'Booking',
              value: (
                <Text as="b">
                  {reservation?.platform_id ?? payment.reservation_id}
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
            {
              label: 'Channel',
              value: (
                <Text as="b" textTransform="capitalize">
                  {reservation?.platform ?? '—'}
                </Text>
              ),
            },
          ]}
        />

        <Flex gap="8px" mt="12px" wrap="wrap">
          {canRefund ? (
            <Button size="sm" variant="dark" flex="1" minW="110px">
              Issue refund
            </Button>
          ) : null}
          {canRetry ? (
            <Button size="sm" variant="dark" flex="1" minW="110px">
              Retry charge
            </Button>
          ) : null}
          <Button size="sm" variant="soft">
            View booking
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
