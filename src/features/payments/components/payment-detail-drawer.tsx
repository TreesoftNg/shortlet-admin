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
  SimpleGrid,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { STAFF_REFUND_REASONS, type StaffRefundReason } from '@/features/bookings/types';
import {
  formatMoney,
  formatRefundKind,
  formatRefundReason,
  getRefundStatusDisplay,
} from '@/features/bookings/utils/booking-display';
import {
  useCreateStayRefund,
  useVerifyPayment,
} from '@/features/payments/hooks/use-payment-mutations';
import { usePayment } from '@/features/payments/hooks/use-payments';
import {
  EmptyState,
  KeyValueList,
  PageSkeleton,
  StatusBadge,
} from '@/shared/components/ui';
import {
  formatPaymentDateTime,
  formatProviderLabel,
  getPaymentStatusDisplay,
} from '../utils/payment-filters';

type PaymentDetailDrawerProps = {
  paymentId: string | null;
  onOpenBooking?: (bookingId: string) => void;
};

export function PaymentDetailDrawer({
  paymentId,
  onOpenBooking,
}: PaymentDetailDrawerProps) {
  const toast = useToast();
  const { data: profile } = useMe();
  const canRefund = hasPermission(profile, 'payment.refund');
  const { data: payment, isLoading, isError, error, refetch } = usePayment(
    paymentId,
    Boolean(paymentId),
  );
  const verifyMutation = useVerifyPayment();
  const refundMutation = useCreateStayRefund();

  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] =
    useState<StaffRefundReason>('guest_cancellation');
  const [refundNote, setRefundNote] = useState('');

  if (!paymentId) return null;

  if (isLoading) {
    return <PageSkeleton variant="form" />;
  }

  if (isError || !payment) {
    return (
      <EmptyState
        title="Could not load payment"
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

  const status = getPaymentStatusDisplay(payment.status);
  const amount = Number(payment.amount);
  const refunded = Number(payment.amountRefunded);
  const refundable = Math.max(
    0,
    Math.round((amount - refunded) * 100) / 100,
  );
  const canIssueRefund =
    canRefund &&
    refundable > 0 &&
    (payment.status === 'successful' ||
      payment.status === 'partially_refunded');

  const handleVerify = async () => {
    try {
      await verifyMutation.mutateAsync(payment.id);
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

  const handleRefund = async () => {
    const value = Number(refundAmount);
    if (!Number.isFinite(value) || value <= 0 || value > refundable) {
      toast({
        title: 'Invalid amount',
        description: `Enter an amount up to ${formatMoney(refundable, payment.currency)}.`,
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await refundMutation.mutateAsync({
        id: payment.id,
        input: {
          amount: value,
          reason: refundReason,
          note: refundNote.trim() || undefined,
        },
      });
      setShowRefund(false);
      toast({
        title: 'Stay refund started',
        status: 'success',
        duration: 2500,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not refund',
        description: err instanceof Error ? err.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (showRefund) {
    return (
      <VStack align="stretch" spacing="14px">
        <Heading as="h3" fontSize="18px">
          Refund stay
        </Heading>
        <Text fontSize="14px" color="ink.400">
          Up to {formatMoney(refundable, payment.currency)}. Deposit releases
          happen from the booking.
        </Text>
        <FormControl isRequired>
          <FormLabel>Amount</FormLabel>
          <Input
            type="number"
            step="0.01"
            min={0.01}
            max={refundable}
            value={refundAmount}
            onChange={(event) => setRefundAmount(event.target.value)}
          />
          <FormHelperText>
            Max {formatMoney(refundable, payment.currency)}
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
            onClick={() => setShowRefund(false)}
            isDisabled={refundMutation.isPending}
          >
            Back
          </Button>
          <Button
            flex="1"
            onClick={() => void handleRefund()}
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
            {formatMoney(payment.amount, payment.currency)}
          </Heading>
          <Text color="ink.400" fontSize="13px" mt="2px" noOfLines={1}>
            {payment.reference}
          </Text>
        </Box>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="40px">
        <Box minW={0}>
          <KeyValueList
            title="Payment"
            items={[
              {
                label: 'Provider',
                value: <Text as="b">{formatProviderLabel(payment.provider)}</Text>,
              },
              {
                label: 'Method',
                value: <Text as="b">{payment.paymentMethod ?? '—'}</Text>,
              },
              {
                label: 'Flutterwave id',
                value: (
                  <Text as="b">{payment.providerTransactionId ?? '—'}</Text>
                ),
              },
              {
                label: 'Fee',
                value: (
                  <Text as="b">
                    {payment.providerFee
                      ? formatMoney(payment.providerFee, payment.currency)
                      : '—'}
                  </Text>
                ),
              },
              {
                label: 'Refunded',
                value: (
                  <Text as="b">
                    {formatMoney(payment.amountRefunded, payment.currency)}
                  </Text>
                ),
              },
              {
                label: 'Paid at',
                value: (
                  <Text as="b">
                    {payment.paidAt
                      ? formatPaymentDateTime(payment.paidAt)
                      : '—'}
                  </Text>
                ),
              },
              {
                label: 'Created',
                value: (
                  <Text as="b">{formatPaymentDateTime(payment.createdAt)}</Text>
                ),
              },
              {
                label: 'Failure',
                value: <Text as="b">{payment.failureReason ?? '—'}</Text>,
              },
            ]}
          />
        </Box>
        <Box minW={0}>
          <KeyValueList
            title="Booking"
            items={[
              {
                label: 'Reference',
                value: (
                  <Text as="b">{payment.bookingReference ?? payment.bookingId}</Text>
                ),
              },
            ]}
          />
        </Box>
      </SimpleGrid>

      <Box mb="16px">
        <Text fontSize="13px" fontWeight={700} mb="8px" color="ink.400">
          Refunds
        </Text>
        {payment.refunds.length === 0 ? (
          <Text fontSize="14px" color="ink.300">
            No refunds on this payment.
          </Text>
        ) : (
          <VStack align="stretch" spacing="10px">
            {payment.refunds.map((refund) => {
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
                      {formatMoney(refund.amount, payment.currency)}
                    </Text>
                    <StatusBadge tone={refundStatus.tone}>
                      {refundStatus.label}
                    </StatusBadge>
                  </Flex>
                  <Text
                    fontSize="13px"
                    color="ink.400"
                    textTransform="capitalize"
                  >
                    {formatRefundReason(refund.reason)}
                    {refund.note ? ` · ${refund.note}` : ''}
                  </Text>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      <Flex gap="8px" mt="12px" wrap="wrap">
        <Button
          size="sm"
          variant="soft"
          onClick={() => void handleVerify()}
          isLoading={verifyMutation.isPending}
        >
          Check with Flutterwave
        </Button>
        {canIssueRefund ? (
          <Button
            size="sm"
            variant="dark"
            onClick={() => {
              setRefundAmount(String(refundable));
              setRefundReason('guest_cancellation');
              setRefundNote('');
              setShowRefund(true);
            }}
          >
            Refund stay
          </Button>
        ) : null}
        {onOpenBooking ? (
          <Button
            size="sm"
            variant="soft"
            onClick={() => onOpenBooking(payment.bookingId)}
          >
            View booking
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
}
