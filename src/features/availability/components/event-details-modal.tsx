'use client';

import { Button, Flex, Text, useToast } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useState } from 'react';
import { BookingQuickView } from '@/features/bookings/live/booking-quick-view';
import { formatStayDate, describeBlockApiError, BLOCK_REASON_LABELS } from '@/features/calendar-sync/utils/calendar-sync-format';
import { AppModal, KeyValueList } from '@/shared/components/ui';
import { calendarSyncHref } from '@/shared/utils/calendar-deep-links';
import { useRemoveBlock } from '../hooks/use-availability-actions';
import type { CalendarEvent, CalendarUnitRow } from '../types';

type EventDetailsModalProps = {
  event: CalendarEvent | null;
  unit: CalendarUnitRow | null;
  onClose: () => void;
  canManageBlocks: boolean;
  canRecordPayments: boolean;
};

/** What a bar on the grid is: a direct booking, a channel stay or a block. */
export function EventDetailsModal({ event, unit, onClose, canManageBlocks, canRecordPayments }: EventDetailsModalProps) {
  if (!event) return null;
  if (event.bookingId) {
    return (
      <BookingQuickView bookingId={event.bookingId} onClose={onClose} canRecordPayments={canRecordPayments} />
    );
  }
  if (event.kind === 'external') {
    return <ExternalStayModal event={event} unit={unit} onClose={onClose} />;
  }
  return <BlockModal event={event} unit={unit} onClose={onClose} canManage={canManageBlocks} />;
}

function ExternalStayModal({ event, unit, onClose }: { event: CalendarEvent; unit: CalendarUnitRow | null; onClose: () => void }) {
  return (
    <AppModal
      isOpen
      onClose={onClose}
      title="Airbnb / Booking.com stay"
      size="2xl"
      footer={
        <>
          <Button as={NextLink} href={calendarSyncHref(event.unitId)} variant="secondary">
            Open in Calendar sync
          </Button>
          <Button onClick={onClose}>Close</Button>
        </>
      }
    >
      <Text color="ink.400" fontSize="14px" mb="8px">
        Imported from Hospitable. Change it on Airbnb or Booking.com; the next sync updates this calendar.
      </Text>
      <KeyValueList
        items={[
          { label: 'Unit', value: unit?.name ?? '—' },
          { label: 'Guest', value: event.label },
          { label: 'Reservation code', value: event.reservationCode ?? '—' },
          { label: 'Check-in', value: formatStayDate(event.startDate) },
          { label: 'Check-out', value: formatStayDate(event.endDate) },
          ...(event.conflict ? [{ label: 'Warning', value: 'Overlaps another stay on this unit' }] : []),
        ]}
      />
    </AppModal>
  );
}

function BlockModal({
  event,
  unit,
  onClose,
  canManage,
}: {
  event: CalendarEvent;
  unit: CalendarUnitRow | null;
  onClose: () => void;
  canManage: boolean;
}) {
  const toast = useToast();
  const remove = useRemoveBlock();
  const [confirming, setConfirming] = useState(false);

  const removeBlock = async () => {
    if (!event.blockId) return;
    try {
      await remove.mutateAsync({ unitId: event.unitId, blockId: event.blockId });
      toast({ status: 'success', title: 'Block removed' });
      onClose();
    } catch {
      // Shown below.
    }
  };

  return (
    <AppModal
      isOpen
      onClose={onClose}
      title="Blocked dates"
      size="2xl"
      footer={
        <Flex gap="8px">
          {canManage ? (
            confirming ? (
              <Button colorScheme="red" onClick={() => void removeBlock()} isLoading={remove.isPending}>
                Yes, remove block
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setConfirming(true)}>
                Remove block
              </Button>
            )
          ) : null}
          <Button onClick={onClose}>Close</Button>
        </Flex>
      }
    >
      <KeyValueList
        items={[
          { label: 'Unit', value: unit?.name ?? '—' },
          { label: 'Reason', value: event.blockReason ? BLOCK_REASON_LABELS[event.blockReason] : 'Blocked' },
          { label: 'Note', value: event.blockNote ?? '—' },
          { label: 'First night', value: formatStayDate(event.startDate) },
          { label: 'Checkout day', value: formatStayDate(event.endDate) },
        ]}
      />
      {remove.error ? (
        <Text mt="12px" color="status.danger" fontSize="14px" role="alert">
          {describeBlockApiError(remove.error)}
        </Text>
      ) : null}
    </AppModal>
  );
}
