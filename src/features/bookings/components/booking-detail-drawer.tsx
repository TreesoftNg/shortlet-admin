'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import {
  useCancelBooking,
  useCheckInBooking,
  useReleaseDeposit,
} from '@/features/bookings/hooks/use-booking-mutations';
import { useBooking } from '@/features/bookings/hooks/use-bookings';
import {
  canCancelBooking,
  canCheckInBooking,
  canReleaseDeposit,
  confirmingPayment,
  formatDateTimeLabel,
  formatGuestsLabel,
  formatMoney,
  formatRefundKind,
  formatRefundReason,
  formatStayDates,
  getBookingStatusDisplay,
  getDepositStatusDisplay,
  getPaymentStatusDisplay,
  getRefundStatusDisplay,
  guestFullName,
  stayRefundableBalance,
  timelineTitle,
  unitLabel,
} from '@/features/bookings/utils/booking-display';
import { STAFF_REFUND_REASONS, type StaffRefundReason } from '@/features/bookings/types';
import {
  createStayRefund,
  verifyPayment,
} from '@/features/payments/api/payments-service';
import {
  ActivityTimeline,
  EmptyState,
  KeyValueList,
  PageSkeleton,
  StatusBadge,
} from '@/shared/components/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';

type BookingDetailDrawerProps = {
  bookingId: string | null;
};

type DialogMode = 'none' | 'cancel' | 'deposit' | 'refund';

export function BookingDetailDrawer({ bookingId }: BookingDetailDrawerProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useMe();
  const canUpdate = hasPermission(profile, 'booking.update');
  const canCancel = hasPermission(profile, 'booking.cancel');
  const canRefund = hasPermission(profile, 'payment.refund');

  const { data: booking, isLoading, isError, error, refetch } = useBooking(
    bookingId,
    Boolean(bookingId),
  );

  const checkInMutation = useCheckInBooking();
  const cancelMutation = useCancelBooking();
  const releaseMutation = useReleaseDeposit();

  const [dialog, setDialog] = useState<DialogMode>('none');
  const [cancelReason, setCancelReason] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [deductionReason, setDeductionReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] =
    useState<StaffRefundReason>('guest_cancellation');
  const [refundNote, setRefundNote] = useState('');

  const verifyMutation = useMutation({
    mutationFn: (paymentId: string) => verifyPayment(paymentId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
      ]);
    },
  });

  const refundMutation = useMutation({
    mutationFn: ({
      paymentId,
      amount,
      reason,
      note,
    }: {
      paymentId: string;
      amount: number;
      reason: StaffRefundReason;
      note?: string;
    }) => createStayRefund(paymentId, { amount, reason, note }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.payments.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
      ]);
    },
  });

  if (!bookingId) return null;

  if (isLoading) {
    return <PageSkeleton variant="form" />;
  }

  if (isError || !booking) {
    return (
      <EmptyState
        title="Could not load booking"
        description={
          error instanceof Error ? error.message : 'Try again in a moment.'
        }
        action={
          <Button size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  const status = getBookingStatusDisplay(booking.status);
  const deposit = getDepositStatusDisplay(booking.deposit.status);
  const name = guestFullName(booking);
  const checkInEnabled = canUpdate && canCheckInBooking(booking);
  const cancelEnabled = canCancel && canCancelBooking(booking);
  const depositEnabled = canRefund && canReleaseDeposit(booking);
  const refundBalance = stayRefundableBalance(booking);
  const paidPayment = confirmingPayment(booking);
  const refundEnabled = canRefund && Boolean(paidPayment) && refundBalance > 0;
  const actionPending =
    checkInMutation.isPending ||
    cancelMutation.isPending ||
    releaseMutation.isPending ||
    refundMutation.isPending ||
    verifyMutation.isPending;

  const openDepositDialog = () => {
    setDepositAmount(booking.deposit.amount);
    setDeductionReason('');
    setDialog('deposit');
  };

  const openRefundDialog = () => {
    setRefundAmount(String(refundBalance));
    setRefundReason('guest_cancellation');
    setRefundNote('');
    setDialog('refund');
  };

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync(booking.id);
      toast({
        title: 'Guest checked in',
        description: `${name} is now checked in`,
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not check in guest',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleCancel = async () => {
    const reason = cancelReason.trim();
    if (!reason) {
      toast({
        title: 'Reason required',
        description: 'Enter why this booking is being cancelled.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await cancelMutation.mutateAsync({ id: booking.id, reason });
      setDialog('none');
      setCancelReason('');
      toast({
        title: 'Booking cancelled',
        description:
          'No money was refunded. Refund the stay or deposit separately if needed.',
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not cancel booking',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleReleaseDeposit = async () => {
    const amount = Number(depositAmount);
    if (!Number.isFinite(amount) || amount < 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter how much of the deposit to return.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const depositTotal = Number(booking.deposit.amount);
    if (amount < depositTotal && !deductionReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Say why part of the deposit is being kept.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await releaseMutation.mutateAsync({
        id: booking.id,
        input: {
          refundAmount: amount,
          deductionReason:
            amount < depositTotal ? deductionReason.trim() : null,
        },
      });
      setDialog('none');
      toast({
        title: 'Deposit released',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not release deposit',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleRefundStay = async () => {
    if (!paidPayment) return;
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > refundBalance) {
      toast({
        title: 'Invalid amount',
        description: `Enter an amount up to ${formatMoney(refundBalance, booking.currency)}.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await refundMutation.mutateAsync({
        paymentId: paidPayment.id,
        amount,
        reason: refundReason,
        note: refundNote.trim() || undefined,
      });
      setDialog('none');
      toast({
        title: 'Stay refund started',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not refund stay',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleVerify = async (paymentId: string) => {
    try {
      await verifyMutation.mutateAsync(paymentId);
      toast({
        title: 'Checked with Flutterwave',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not verify payment',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const activity = booking.timeline.map((entry, index) => ({
    id: `${booking.id}-tl-${index}`,
    title: timelineTitle(entry.event),
    timestamp: formatDateTimeLabel(entry.at),
  }));

  if (dialog === 'cancel') {
    return (
      <VStack align="stretch" spacing="14px">
        <Heading as="h3" fontSize="18px">
          Cancel booking
        </Heading>
        <Text fontSize="14px" color="ink.400">
          No money is refunded here. Refund the stay and deposit separately if
          needed.
        </Text>
        <FormControl isRequired>
          <FormLabel>Reason</FormLabel>
          <Textarea
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Why is this booking being cancelled?"
            rows={4}
          />
        </FormControl>
        <Flex gap="8px">
          <Button
            flex="1"
            variant="soft"
            onClick={() => setDialog('none')}
            isDisabled={actionPending}
          >
            Back
          </Button>
          <Button
            flex="1"
            colorScheme="red"
            onClick={() => void handleCancel()}
            isLoading={cancelMutation.isPending}
          >
            Cancel booking
          </Button>
        </Flex>
      </VStack>
    );
  }

  if (dialog === 'deposit') {
    const depositTotal = Number(booking.deposit.amount);
    const amount = Number(depositAmount);
    const keepingPart =
      Number.isFinite(amount) && amount < depositTotal;
    return (
      <VStack align="stretch" spacing="14px">
        <Heading as="h3" fontSize="18px">
          Release deposit
        </Heading>
        <Text fontSize="14px" color="ink.400">
          Held amount:{' '}
          {formatMoney(booking.deposit.amount, booking.currency)}. Enter how
          much to return to the guest.
        </Text>
        <FormControl isRequired>
          <FormLabel>Refund amount</FormLabel>
          <Input
            type="number"
            step="0.01"
            min={0}
            max={depositTotal}
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
          />
        </FormControl>
        {keepingPart ? (
          <FormControl isRequired>
            <FormLabel>Reason for keeping part</FormLabel>
            <Textarea
              value={deductionReason}
              onChange={(event) => setDeductionReason(event.target.value)}
              placeholder="e.g. Broken glass table"
              rows={3}
            />
          </FormControl>
        ) : null}
        <Flex gap="8px">
          <Button
            flex="1"
            variant="soft"
            onClick={() => setDialog('none')}
            isDisabled={actionPending}
          >
            Back
          </Button>
          <Button
            flex="1"
            onClick={() => void handleReleaseDeposit()}
            isLoading={releaseMutation.isPending}
          >
            Release deposit
          </Button>
        </Flex>
      </VStack>
    );
  }

  if (dialog === 'refund') {
    return (
      <VStack align="stretch" spacing="14px">
        <Heading as="h3" fontSize="18px">
          Refund stay
        </Heading>
        <Text fontSize="14px" color="ink.400">
          Up to {formatMoney(refundBalance, booking.currency)}. The deposit is
          released separately.
        </Text>
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.01"
            min={0.01}
            max={refundBalance}
            value={refundAmount}
            onChange={(event) => setRefundAmount(event.target.value)}
          />
          <FormHelperText>
            Max {formatMoney(refundBalance, booking.currency)}
          </FormHelperText>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Reason</FormLabel>
          <Select
            value={refundReason}
            onChange={(event) =>
              setRefundReason(event.target.value as StaffRefundReason)
            }
          >
            {STAFF_REFUND_REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Note</FormLabel>
          <Textarea
            value={refundNote}
            onChange={(event) => setRefundNote(event.target.value)}
            rows={3}
          />
        </FormControl>
        <Flex gap="8px">
          <Button
            flex="1"
            variant="soft"
            onClick={() => setDialog('none')}
            isDisabled={actionPending}
          >
            Back
          </Button>
          <Button
            flex="1"
            onClick={() => void handleRefundStay()}
            isLoading={refundMutation.isPending}
          >
            Refund stay
          </Button>
        </Flex>
      </VStack>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" gap="12px" mb="12px">
        <Box minW={0}>
          <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
            {booking.reference}
          </Heading>
          <Text color="ink.400" fontSize="13px" mt="2px" noOfLines={1}>
            {name} · {unitLabel(booking)}
          </Text>
        </Box>
        <StatusBadge tone={status.tone} flexShrink={0}>
          {status.label}
        </StatusBadge>
      </Flex>

      <Flex gap="8px" mb="16px" wrap="wrap">
        {checkInEnabled ? (
          <Button
            size="sm"
            onClick={() => void handleCheckIn()}
            isLoading={checkInMutation.isPending}
            isDisabled={actionPending}
          >
            Check in
          </Button>
        ) : null}
        {cancelEnabled ? (
          <Button
            size="sm"
            variant="soft"
            onClick={() => {
              setCancelReason('');
              setDialog('cancel');
            }}
            isDisabled={actionPending}
          >
            Cancel
          </Button>
        ) : null}
        {depositEnabled ? (
          <Button
            size="sm"
            variant="soft"
            onClick={openDepositDialog}
            isDisabled={actionPending}
          >
            Release deposit
          </Button>
        ) : null}
        {refundEnabled ? (
          <Button
            size="sm"
            variant="soft"
            onClick={openRefundDialog}
            isDisabled={actionPending}
          >
            Refund stay
          </Button>
        ) : null}
      </Flex>

      <KeyValueList
        title="Guest"
        items={[
          { label: 'Name', value: <Text as="b">{name}</Text> },
          { label: 'Email', value: <Text as="b">{booking.guest.email}</Text> },
          { label: 'Phone', value: <Text as="b">{booking.guest.phone}</Text> },
          {
            label: 'Requests',
            value: (
              <Text as="b">{booking.specialRequests?.trim() || '—'}</Text>
            ),
          },
          {
            label: 'House rules accepted',
            value: (
              <Text as="b">
                {formatDateTimeLabel(booking.houseRulesAcceptedAt)}
              </Text>
            ),
          },
        ]}
      />

      <KeyValueList
        title="Stay"
        items={[
          { label: 'Unit', value: <Text as="b">{unitLabel(booking)}</Text> },
          {
            label: 'Dates',
            value: (
              <Text as="b">
                {formatStayDates(booking.checkIn, booking.checkOut)} (
                {booking.nights} nights)
              </Text>
            ),
          },
          {
            label: 'Times',
            value: (
              <Text as="b">
                In {booking.checkInTime} · Out {booking.checkOutTime}
              </Text>
            ),
          },
          {
            label: 'Guests',
            value: <Text as="b">{formatGuestsLabel(booking)}</Text>,
          },
        ]}
      />

      <KeyValueList
        title="Price"
        items={[
          {
            label: 'Nights',
            value: (
              <Text as="b">
                {formatMoney(booking.price.nightsSubtotal, booking.currency)}
              </Text>
            ),
          },
          {
            label: 'Discount',
            value: (
              <Text as="b">
                {booking.price.discount
                  ? `−${formatMoney(booking.price.discount.amount, booking.currency)} (${booking.price.discount.percent}%)`
                  : '—'}
              </Text>
            ),
          },
          {
            label: 'Cleaning',
            value: (
              <Text as="b">
                {formatMoney(booking.price.cleaningFee, booking.currency)}
              </Text>
            ),
          },
          {
            label: 'Service fee',
            value: (
              <Text as="b">
                {formatMoney(booking.price.serviceFee.amount, booking.currency)}
              </Text>
            ),
          },
          {
            label: booking.price.tax.name || 'Tax',
            value: (
              <Text as="b">
                {formatMoney(booking.price.tax.amount, booking.currency)}
              </Text>
            ),
          },
          {
            label: 'Stay total',
            value: (
              <Text as="b">
                {formatMoney(booking.stayTotal, booking.currency)}
              </Text>
            ),
          },
          {
            label: 'Paid / refunded',
            value: (
              <Text as="b">
                {formatMoney(booking.amountPaid, booking.currency)} /{' '}
                {formatMoney(booking.amountRefunded, booking.currency)}
              </Text>
            ),
          },
        ]}
      />

      <KeyValueList
        title="Deposit"
        items={[
          {
            label: 'Status',
            value: (
              <StatusBadge tone={deposit.tone}>{deposit.label}</StatusBadge>
            ),
          },
          {
            label: 'Amount',
            value: (
              <Text as="b">
                {formatMoney(booking.deposit.amount, booking.currency)} (
                {booking.deposit.nights} night
                {booking.deposit.nights === 1 ? '' : 's'})
              </Text>
            ),
          },
          {
            label: 'Due by',
            value: (
              <Text as="b">
                {booking.deposit.dueAt
                  ? formatDateTimeLabel(booking.deposit.dueAt)
                  : '—'}
              </Text>
            ),
          },
          {
            label: 'Refunded',
            value: (
              <Text as="b">
                {formatMoney(booking.deposit.refunded, booking.currency)}
              </Text>
            ),
          },
          {
            label: 'Deduction reason',
            value: (
              <Text as="b">
                {booking.deposit.deductionReason?.trim() || '—'}
              </Text>
            ),
          },
        ]}
      />

      <Box mb="16px">
        <Text fontSize="13px" fontWeight={700} mb="8px" color="ink.400">
          Payments
        </Text>
        {booking.payments.length === 0 ? (
          <Text fontSize="14px" color="ink.300">
            No payment attempts yet.
          </Text>
        ) : (
          <VStack align="stretch" spacing="10px">
            {booking.payments.map((payment) => {
              const paymentStatus = getPaymentStatusDisplay(payment.status);
              return (
                <Box
                  key={payment.id}
                  border="1px solid"
                  borderColor="line.500"
                  borderRadius="12px"
                  p="12px"
                >
                  <Flex justify="space-between" gap="8px" mb="6px">
                    <Text fontFamily="mono" fontSize="13px" fontWeight={600}>
                      {payment.reference}
                    </Text>
                    <StatusBadge tone={paymentStatus.tone}>
                      {paymentStatus.label}
                    </StatusBadge>
                  </Flex>
                  <Text fontSize="13px" color="ink.400">
                    {formatMoney(payment.amount, payment.currency)}
                    {payment.paymentMethod
                      ? ` · ${payment.paymentMethod}`
                      : ''}
                    {payment.providerTransactionId
                      ? ` · ${payment.providerTransactionId}`
                      : ''}
                  </Text>
                  <Flex gap="8px" mt="8px" wrap="wrap">
                    <Button
                      size="xs"
                      variant="soft"
                      onClick={() => void handleVerify(payment.id)}
                      isLoading={verifyMutation.isPending}
                      isDisabled={actionPending}
                    >
                      Check with Flutterwave
                    </Button>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      <Box mb="16px">
        <Text fontSize="13px" fontWeight={700} mb="8px" color="ink.400">
          Refunds
        </Text>
        {booking.refunds.length === 0 ? (
          <Text fontSize="14px" color="ink.300">
            No refunds yet.
          </Text>
        ) : (
          <VStack align="stretch" spacing="10px">
            {booking.refunds.map((refund) => {
              const refundStatus = getRefundStatusDisplay(refund.status);
              return (
                <Box
                  key={refund.id}
                  border="1px solid"
                  borderColor="line.500"
                  borderRadius="12px"
                  p="12px"
                >
                  <Flex justify="space-between" gap="8px" mb="6px">
                    <Text fontSize="13px" fontWeight={700}>
                      {formatRefundKind(refund.kind)} ·{' '}
                      {formatMoney(refund.amount, booking.currency)}
                    </Text>
                    <StatusBadge tone={refundStatus.tone}>
                      {refundStatus.label}
                    </StatusBadge>
                  </Flex>
                  <Text fontSize="13px" color="ink.400" textTransform="capitalize">
                    {formatRefundReason(refund.reason)}
                    {refund.note ? ` · ${refund.note}` : ''}
                  </Text>
                  {refund.failureReason ? (
                    <Text fontSize="12px" color="red.500" mt="4px">
                      {refund.failureReason}
                    </Text>
                  ) : null}
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {booking.cancellationReason ? (
        <KeyValueList
          title="Cancellation"
          items={[
            {
              label: 'By',
              value: (
                <Text as="b" textTransform="capitalize">
                  {booking.cancelledBy ?? '—'}
                </Text>
              ),
            },
            {
              label: 'Reason',
              value: <Text as="b">{booking.cancellationReason}</Text>,
            },
          ]}
        />
      ) : null}

      <ActivityTimeline title="Timeline" items={activity} />
    </Box>
  );
}
