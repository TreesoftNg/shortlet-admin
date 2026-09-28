'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { PropertyCell } from '@/shared/components/ui/property-cell';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import type { Reservation } from '@/shared/types/hospitable';
import { getUnitName } from '../utils/get-unit-name';
import {
  formatMoney,
  formatStayDates,
  getPaymentDisplayStatus,
  getReservationDisplayStatus,
} from '../utils/reservation-display';

export type BookingTableVariant = 'dashboard' | 'bookings';

/**
 * Shared reservation column definitions.
 * Dashboard and Bookings pages compose subsets of these columns.
 */
export function getBookingColumns(
  variant: BookingTableVariant = 'dashboard',
): DataTableColumn<Reservation>[] {
  const reference: DataTableColumn<Reservation> = {
    id: 'reference',
    header: 'Reference',
    meta: { fontFamily: 'mono', fontWeight: 600 },
    cell: (row) => row.platform_id,
  };

  const guest: DataTableColumn<Reservation> = {
    id: 'guest',
    header: 'Guest',
    cell: (row) => {
      if (variant === 'dashboard') {
        return row.guest?.full_name ?? '—';
      }

      const isExternal = row.platform !== 'direct' && row.platform !== 'manual';

      return (
        <Box>
          <Text fontWeight={700}>{row.guest?.full_name ?? '—'}</Text>
          {isExternal ? (
            <Text color="ink.300" fontSize="12px">
              External · {row.platform}
            </Text>
          ) : null}
        </Box>
      );
    },
  };

  const property: DataTableColumn<Reservation> = {
    id: 'property',
    header: variant === 'dashboard' ? 'Property / Unit' : 'Property',
    cell: (row) => {
      if (variant === 'dashboard') {
        return (
          <PropertyCell
            name={row.property?.name}
            subtitle={getUnitName(row)}
            imageUrl={row.property?.picture}
          />
        );
      }

      return (
        <Text>
          {row.property?.name ?? '—'} · {getUnitName(row)}
        </Text>
      );
    },
  };

  const dates: DataTableColumn<Reservation> = {
    id: 'dates',
    header: variant === 'dashboard' ? 'Dates' : 'Stay',
    cell: (row) => {
      const label = formatStayDates(row.arrival_date, row.departure_date);
      if (variant === 'dashboard') return label;

      return (
        <Box>
          <Text>{label}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.nights} nights
          </Text>
        </Box>
      );
    },
  };

  const amount: DataTableColumn<Reservation> = {
    id: 'amount',
    header: variant === 'dashboard' ? 'Amount' : 'Total',
    meta: { fontWeight: 700 },
    cell: (row) =>
      row.financials
        ? formatMoney(row.financials.total, row.financials.currency)
        : '—',
  };

  const payment: DataTableColumn<Reservation> = {
    id: 'payment',
    header: 'Payment',
    cell: (row) => {
      const paymentStatus = getPaymentDisplayStatus(row);
      return <StatusBadge tone={paymentStatus.tone}>{paymentStatus.label}</StatusBadge>;
    },
  };

  const status: DataTableColumn<Reservation> = {
    id: 'status',
    header: 'Status',
    cell: (row) => {
      const display = getReservationDisplayStatus(row);
      return <StatusBadge tone={display.tone}>{display.label}</StatusBadge>;
    },
  };

  if (variant === 'bookings') {
    return [reference, guest, property, dates, amount, status];
  }

  return [reference, guest, property, dates, amount, payment, status];
}

export function renderBookingMobileCard(reservation: Reservation): ReactNode {
  const payment = getPaymentDisplayStatus(reservation);
  const status = getReservationDisplayStatus(reservation);

  return (
    <>
      <Flex justify="space-between" gap="8px" mb="10px">
        <Text fontFamily="mono" fontWeight={600} fontSize="13px">
          {reservation.platform_id}
        </Text>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>
      <Text fontWeight={700} mb="4px">
        {reservation.guest?.full_name ?? '—'}
      </Text>
      <Text color="ink.300" fontSize="13px" mb="10px">
        {reservation.property?.name} · {getUnitName(reservation)}
      </Text>
      <Flex justify="space-between" align="center" gap="8px" wrap="wrap">
        <Text fontSize="13px" color="ink.400">
          {formatStayDates(reservation.arrival_date, reservation.departure_date)}
        </Text>
        <Text fontWeight={700}>
          {reservation.financials
            ? formatMoney(reservation.financials.total, reservation.financials.currency)
            : '—'}
        </Text>
        <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
      </Flex>
    </>
  );
}
