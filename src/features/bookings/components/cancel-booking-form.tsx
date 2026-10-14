'use client';

import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { FormPanel, FormRow } from '@/shared/components/ui';
import {
  STAFF_REFUND_REASONS,
  type AdminBooking,
  type CancelBookingInput,
  type StaffRefundReason,
} from '../types';
import { formatMoney, guestFullName } from '../utils/booking-display';
import {
  buildCancelInput,
  cancelFormDefaults,
  cancelRefundOptions,
  cancelRefundTotal,
  type CancelFormErrors,
  type CancelFormValues,
} from '../utils/cancel-booking';

type CancelBookingFormProps = {
  booking: AdminBooking;
  /** Holds payment.refund. */
  canRefund: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (input: CancelBookingInput) => void;
};

/** Cancel a booking and, in the same step, refund the stay and return the deposit. */
export function CancelBookingForm({
  booking,
  canRefund,
  isSubmitting,
  onBack,
  onSubmit,
}: CancelBookingFormProps) {
  const options = useMemo(
    () => cancelRefundOptions(booking, canRefund),
    [booking, canRefund],
  );
  const [values, setValues] = useState<CancelFormValues>(() =>
    cancelFormDefaults(booking, options),
  );
  const [errors, setErrors] = useState<CancelFormErrors>({});
  const currency = booking.currency;
  const money = (amount: number | string) => formatMoney(amount, currency);
  const update = (changes: Partial<CancelFormValues>) =>
    setValues((current) => ({ ...current, ...changes }));

  const stayAmount = Number(values.stayRefund || 0);
  const refundsAnything = options.canRefundStay || options.canReturnDeposit;

  const submit = () => {
    const result = buildCancelInput(values, options, currency);
    if ('errors' in result) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(result.input);
  };

  return (
    <FormPanel
      title="Cancel booking"
      description={`${booking.reference} · ${guestFullName(booking)}`}
      footer={
        <>
          <Text>
            {refundsAnything
              ? `Guest gets back ${money(cancelRefundTotal(values, options))} of ${money(booking.amountPaid)} paid.`
              : canRefund
                ? 'Nothing has been paid that can be refunded.'
                : 'Someone with refund access can refund this after it is cancelled.'}
          </Text>
          <Flex gap="8px" justify="flex-end">
            <Button variant="soft" onClick={onBack} isDisabled={isSubmitting}>
              Back
            </Button>
            <Button variant="danger" onClick={submit} isLoading={isSubmitting}>
              Cancel booking
            </Button>
          </Flex>
        </>
      }
    >
      <FormRow
        label="Reason"
        labelFor="cancel-reason"
        description="Shown on the booking and in the guest's email."
        error={errors.reason}
        isStacked
      >
        <Textarea
          id="cancel-reason"
          value={values.reason}
          onChange={(event) => update({ reason: event.target.value })}
          placeholder="Why is this booking being cancelled?"
          rows={3}
          isInvalid={Boolean(errors.reason)}
        />
      </FormRow>

      {options.canRefundStay ? (
        <FormRow
          label="Refund the stay"
          labelFor="cancel-stay-refund"
          description={`Up to ${money(options.stayLeft)} of the stay. Enter ${money(0)} to refund none.`}
          error={errors.stayRefund}
        >
          <InputGroup w={{ base: '100%', md: '200px' }} flexShrink={0}>
            <InputLeftElement h="40px" color="ink.300" fontSize="14px">
              {currency === 'NGN' ? '₦' : currency}
            </InputLeftElement>
            <Input
              id="cancel-stay-refund"
              type="number"
              inputMode="decimal"
              min={0}
              max={options.stayLeft}
              step="0.01"
              value={values.stayRefund}
              onChange={(event) => update({ stayRefund: event.target.value })}
              isInvalid={Boolean(errors.stayRefund)}
              h="40px"
              fontSize="14px"
            />
          </InputGroup>
        </FormRow>
      ) : null}

      {options.canRefundStay && stayAmount > 0 ? (
        <FormRow label="Refund reason" labelFor="cancel-refund-reason" nested>
          <Select
            id="cancel-refund-reason"
            w={{ base: '100%', md: '200px' }}
            flexShrink={0}
            value={values.refundReason}
            onChange={(event) =>
              update({ refundReason: event.target.value as StaffRefundReason })
            }
          >
            {STAFF_REFUND_REASONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </FormRow>
      ) : null}

      {options.canReturnDeposit ? (
        <FormRow
          label={`Return the deposit (${money(options.depositLeft)})`}
          labelFor="cancel-return-deposit"
          description={
            booking.status === 'checked_in'
              ? 'The guest is checked in: inspect the apartment first. You can return it later.'
              : 'The whole deposit still held goes back to the guest.'
          }
          isInline
        >
          <Switch
            id="cancel-return-deposit"
            isChecked={values.returnDeposit}
            onChange={(event) => update({ returnDeposit: event.target.checked })}
          />
        </FormRow>
      ) : null}
    </FormPanel>
  );
}
