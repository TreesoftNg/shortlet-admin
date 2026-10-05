'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import type { DataTableColumn } from '@/shared/components/ui/data-table';
import { PropertyCell } from '@/shared/components/ui/property-cell';
import { StatusBadge } from '@/shared/components/ui/status-badge';
import type { Reservation } from '@/shared/types/hospitable';
import {
  formatMoney,
  formatStayDates,
  getBookingStatusDisplay,
  getDepositStatusDisplay,
  unitLabel,
} from '../utils/booking-display';
import { getUnitName } from '../utils/get-unit-name';
import {
  formatMoney as formatReservationMoney,
  formatStayDates as formatReservationStayDates,
  getPaymentDisplayStatus,
  getReservationDisplayStatus,
} from '../utils/reservation-display';
import type { BookingListItem } from '../types';

export type BookingTableVariant = 'dashboard' | 'bookings';

/** Columns for the live bookings list (API BookingListItem). */
export function getBookingListColumns(): DataTableColumn<BookingListItem>[] {
  return [
    {
      id: 'reference',
      header: 'Reference',
      meta: { fontFamily: 'mono', fontWeight: 600 },
      cell: (row) => row.reference,
    },
    {
      id: 'guest',
      header: 'Guest',
      cell: (row) => (
        <Box>
          <Text fontWeight={700}>{row.guestName || '—'}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.guestEmail}
          </Text>
        </Box>
      ),
    },
    {
      id: 'property',
      header: 'Property',
      cell: (row) => <Text>{unitLabel(row)}</Text>,
    },
    {
      id: 'dates',
      header: 'Stay',
      cell: (row) => (
        <Box>
          <Text>{formatStayDates(row.checkIn, row.checkOut)}</Text>
          <Text color="ink.300" fontSize="12px">
            {row.nights} nights · {row.guestCount} guests
          </Text>
        </Box>
      ),
    },
    {
      id: 'amount',
      header: 'Total',
      meta: { fontWeight: 700 },
      cell: (row) => formatMoney(row.totalAmount, row.currency),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (row) => {
        const display = getBookingStatusDisplay(row.status);
        return <StatusBadge tone={display.tone}>{display.label}</StatusBadge>;
      },
    },
    {
      id: 'deposit',
      header: 'Deposit',
      cell: (row) => {
        const display = getDepositStatusDisplay(row.depositStatus);
        return <StatusBadge tone={display.tone}>{display.label}</StatusBadge>;
      },
    },
  ];
}

/**
 * Shared reservation column definitions for the dashboard mock.
 * Dashboard still uses Hospitable Reservation until that screen is wired.
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
      const label = formatReservationStayDates(
        row.arrival_date,
        row.departure_date,
      );
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
        ? formatReservationMoney(
            row.financials.total,
            row.financials.currency,
          )
        : '—',
  };

  const payment: DataTableColumn<Reservation> = {
    id: 'payment',
    header: 'Payment',
    cell: (row) => {
      const paymentStatus = getPaymentDisplayStatus(row);
      return (
        <StatusBadge tone={paymentStatus.tone}>{paymentStatus.label}</StatusBadge>
      );
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
          {formatReservationStayDates(
            reservation.arrival_date,
            reservation.departure_date,
          )}
        </Text>
        <Text fontWeight={700}>
          {reservation.financials
            ? formatReservationMoney(
                reservation.financials.total,
                reservation.financials.currency,
              )
            : '—'}
        </Text>
        <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
      </Flex>
    </>
  );
}
