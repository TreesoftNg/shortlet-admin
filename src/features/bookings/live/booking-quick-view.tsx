'use client';

import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Skeleton,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { formatStayDate } from '@/features/calendar-sync/utils/calendar-sync-format';
import { AppModal, KeyValueList } from '@/shared/components/ui';
import {
  BOOKING_STATUS_LABELS,
  bookingErrorMessage,
  formatMoney,
  paymentMethodLabel,
} from './format';
import type { OfflinePaymentMethod } from './types';
import { useAdminBooking, useRecordOfflinePayment } from './use-staff-bookings';

type BookingQuickViewProps = {
  bookingId: string;
  onClose: () => void;
  canRecordPayments: boolean;
};

/** A booking at a glance from the calendar, with payment actions while it waits for payment. */
export function BookingQuickView({ bookingId, onClose, canRecordPayments }: BookingQuickViewProps) {
  const { data: booking, isLoading, error } = useAdminBooking(bookingId);
  const openLink = booking?.payments.find((payment) => payment.checkoutUrl)?.checkoutUrl ?? '';
  const { onCopy, hasCopied } = useClipboard(openLink);
  const [recording, setRecording] = useState(false);
  const waiting = booking?.status === 'pending_payment';

  return (
    <AppModal
      isOpen
      onClose={onClose}
      title={booking ? `Booking ${booking.reference}` : 'Booking'}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {isLoading ? <Skeleton h="240px" borderRadius="14px" /> : null}
      {error ? (
        <Text color="status.danger" role="alert">
          {bookingErrorMessage(error)}
        </Text>
      ) : null}
      {booking ? (
        <>
          <Flex gap="8px" align="center" mb="8px" wrap="wrap">
            <Badge colorScheme={waiting ? 'orange' : booking.status === 'cancelled' ? 'red' : 'green'}>
              {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
            </Badge>
            {booking.source === 'staff' ? <Badge>Booked by staff</Badge> : null}
          </Flex>
          <KeyValueList
            items={[
              { label: 'Guest', value: `${booking.guest.firstName} ${booking.guest.lastName}` },
              { label: 'Email', value: booking.guest.email },
              { label: 'Phone', value: booking.guest.phone },
              { label: 'Unit', value: booking.unit.publicName ?? booking.unit.name },
              { label: 'Check-in', value: `${formatStayDate(booking.checkIn)}, from ${booking.checkInTime}` },
              { label: 'Check-out', value: `${formatStayDate(booking.checkOut)}, by ${booking.checkOutTime}` },
              {
                label: 'Guests',
                value: [
                  plural(booking.guests.adults, 'adult', 'adults'),
                  booking.guests.children ? plural(booking.guests.children, 'child', 'children') : null,
                  booking.guests.infants ? plural(booking.guests.infants, 'infant', 'infants') : null,
                ]
                  .filter(Boolean)
                  .join(', '),
              },
              ...(booking.specialRequests ? [{ label: 'Requests', value: booking.specialRequests }] : []),
            ]}
          />
          <KeyValueList
            title="Money"
            items={[
              ...(booking.price.staffDiscount
                ? [
                    {
                      label: `Discount (${booking.price.staffDiscount.reason})`,
                      value: `-${formatMoney(booking.price.staffDiscount.amount, booking.currency)}`,
                    },
                  ]
                : []),
              { label: 'Stay', value: formatMoney(booking.stayTotal, booking.currency) },
              { label: 'Deposit', value: `${formatMoney(booking.deposit.amount, booking.currency)} (${booking.deposit.status})` },
              { label: 'Total', value: formatMoney(booking.totalAmount, booking.currency), emphasize: true },
              { label: 'Paid', value: formatMoney(booking.amountPaid, booking.currency) },
              ...booking.payments.map((payment) => ({
                label: `${payment.provider === 'offline' ? 'Offline' : 'Flutterwave'} · ${payment.status}`,
                value: `${paymentMethodLabel(payment.paymentMethod)}${payment.offlineReference ? ` · ${payment.offlineReference}` : ''}`,
              })),
            ]}
          />
          {waiting ? (
            <Flex direction="column" gap="10px" mt="8px">
              {booking.holdExpiresAt ? (
                <Text fontSize="14px" color="ink.400">
                  Dates held until {new Date(booking.holdExpiresAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })}.
                </Text>
              ) : null}
              <Flex gap="8px" wrap="wrap">
                {openLink ? (
                  <Button variant="secondary" onClick={onCopy}>
                    {hasCopied ? 'Link copied' : 'Copy payment link'}
                  </Button>
                ) : null}
                {canRecordPayments && !recording ? (
                  <Button onClick={() => setRecording(true)}>Record payment received</Button>
                ) : null}
              </Flex>
              {recording ? <RecordPaymentForm bookingId={booking.id} onDone={() => setRecording(false)} /> : null}
            </Flex>
          ) : null}
        </>
      ) : null}
    </AppModal>
  );
}

function RecordPaymentForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const toast = useToast();
  const record = useRecordOfflinePayment(bookingId);
  const [method, setMethod] = useState<OfflinePaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');

  const submit = async () => {
    try {
      await record.mutateAsync({ method, reference: reference.trim() || null });
      toast({ status: 'success', title: 'Payment recorded. The booking is confirmed.' });
      onDone();
    } catch {
      // Shown below.
    }
  };

  return (
    <Flex direction="column" gap="10px" p="14px" borderRadius="14px" bg="bg.400">
      <FormControl>
        <FormLabel>How the guest paid</FormLabel>
        <Select aria-label="Payment method" value={method} onChange={(event) => setMethod(event.target.value as OfflinePaymentMethod)}>
          <option value="bank_transfer">Bank transfer</option>
          <option value="cash">Cash</option>
          <option value="pos">Card (POS)</option>
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Reference (optional)</FormLabel>
        <Input aria-label="Payment reference" maxLength={100} value={reference} onChange={(event) => setReference(event.target.value)} />
      </FormControl>
      {record.error ? (
        <Text color="status.danger" fontSize="14px" role="alert">
          {bookingErrorMessage(record.error)}
        </Text>
      ) : null}
      <Flex gap="8px">
        <Button onClick={() => void submit()} isLoading={record.isPending}>
          Confirm payment
        </Button>
        <Button variant="secondary" onClick={onDone}>
          Cancel
        </Button>
      </Flex>
    </Flex>
  );
}

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;
