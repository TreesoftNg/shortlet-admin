'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { LuMessageCircle } from 'react-icons/lu';
import { getUnitName } from '@/features/bookings/utils/get-unit-name';
import {
  formatDateTimeLabel,
  formatGuestsLabel,
  formatMoney,
  getReservationDisplayStatus,
} from '@/features/bookings/utils/reservation-display';
import {
  ActivityTimeline,
  KeyValueList,
  StatusBadge,
} from '@/shared/components/ui';
import type { Reservation } from '@/shared/types/hospitable';

type BookingDetailDrawerProps = {
  reservation: Reservation | null;
};

export function BookingDetailDrawer({ reservation }: BookingDetailDrawerProps) {
  if (!reservation) {
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
        Select a booking to see details.
      </Box>
    );
  }

  const status = getReservationDisplayStatus(reservation);
  const fees =
    (reservation.financials?.cleaning_fee ?? 0) +
    (reservation.financials?.linen_fee ?? 0) +
    (reservation.financials?.management_fee ?? 0) +
    (reservation.financials?.resort_fee ?? 0) +
    (reservation.financials?.pet_fee ?? 0) +
    (reservation.financials?.pass_through_taxes ?? 0);
  const otherFees = reservation.financials?.other_fees ?? [];
  const currency = reservation.financials?.currency ?? 'NGN';

  const activity = [
    ...reservation.reservation_status.history.map((entry, index) => ({
      id: `${reservation.id}-status-${index}`,
      title:
        entry.sub_category === 'confirmed'
          ? 'Payment confirmed'
          : entry.sub_category === 'voided'
            ? 'Booking cancelled'
            : entry.sub_category === 'request for payment'
              ? 'Awaiting payment'
              : entry.sub_category === 'checked_in'
                ? 'Guest checked in'
                : entry.sub_category === 'completed'
                  ? 'Stay completed'
                  : entry.sub_category === 'external'
                    ? 'External reservation synced'
                    : 'Status updated',
      timestamp: formatDateTimeLabel(entry.changed_at),
    })),
    {
      id: `${reservation.id}-created`,
      title: 'Booking created',
      timestamp: formatDateTimeLabel(reservation.created_at),
    },
  ];

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
      {reservation.property?.picture ? (
        <Box
          as="img"
          src={reservation.property.picture}
          alt=""
          w="100%"
          h="150px"
          objectFit="cover"
        />
      ) : null}

      <Box px="22px" py="20px">
        <Flex justify="space-between" align="flex-start" gap="12px">
          <Box minW={0}>
            <Text fontSize="12px" color="ink.300" fontFamily="mono">
              {reservation.platform_id}
            </Text>
            <Heading as="h3" fontSize="18px" fontWeight={700} mt="2px">
              {reservation.property?.name} · {getUnitName(reservation)}
            </Heading>
          </Box>
          <StatusBadge tone={status.tone} flexShrink={0}>
            {status.label}
          </StatusBadge>
        </Flex>

        <Flex gap="12px" align="center" my="16px">
          <Avatar
            name={reservation.guest?.full_name ?? undefined}
            src={reservation.guest?.picture_url ?? undefined}
            size="md"
          />
          <Box flex="1" minW={0}>
            <Text fontWeight={700} noOfLines={1}>
              {reservation.guest?.full_name ?? '—'}
            </Text>
            <Text color="ink.300" fontSize="13px" noOfLines={1}>
              {reservation.guest?.email ?? 'No email'} · guest
            </Text>
          </Box>
          <IconButton
            aria-label="Message guest"
            icon={<LuMessageCircle size={16} />}
            w="36px"
            h="36px"
            minW="36px"
            variant="secondary"
            borderRadius="12px"
          />
        </Flex>

        <KeyValueList
          title="Stay"
          items={[
            {
              label: 'Check-in',
              value: <Text as="b">{formatDateTimeLabel(reservation.check_in)}</Text>,
            },
            {
              label: 'Checkout',
              value: <Text as="b">{formatDateTimeLabel(reservation.check_out)}</Text>,
            },
            {
              label: 'Guests',
              value: <Text as="b">{formatGuestsLabel(reservation)}</Text>,
            },
          ]}
        />

        <KeyValueList
          title="Payment"
          items={[
            {
              label: 'Accommodation',
              value: reservation.financials
                ? formatMoney(reservation.financials.accommodation, currency)
                : '—',
            },
            {
              label: 'Fees',
              value: reservation.financials ? formatMoney(fees, currency) : '—',
            },
            ...otherFees.map((fee) => ({
              label: fee.label,
              value: formatMoney(fee.amount, currency),
            })),
            {
              label: 'Total paid',
              value: reservation.financials
                ? formatMoney(reservation.financials.total, currency)
                : '—',
              emphasize: true,
            },
            {
              label: 'Provider',
              value:
                reservation.platform === 'airbnb' ? (
                  <StatusBadge tone="info">Airbnb · Synced</StatusBadge>
                ) : reservation.reservation_status.current.category === 'cancelled' ? (
                  <StatusBadge tone="danger">Refunded</StatusBadge>
                ) : reservation.reservation_status.current.sub_category ===
                  'request for payment' ? (
                  <StatusBadge tone="warn">Pending</StatusBadge>
                ) : (
                  <StatusBadge tone="ok">Card · Successful</StatusBadge>
                ),
            },
          ]}
        />

        <ActivityTimeline items={activity} />

        <Flex gap="8px" mt="4px" wrap="wrap">
          <Button size="sm" variant="dark" flex="1" minW="120px">
            Check in guest
          </Button>
          <Button size="sm" variant="soft">
            Refund
          </Button>
          <Button size="sm" variant="soft" color="status.danger">
            Cancel
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
