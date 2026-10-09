'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  Textarea,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import type { CalendarUnitRow, NightSelection } from '@/features/availability/types';
import { AppModal, KeyValueList } from '@/shared/components/ui';
import { bookingErrorMessage, fieldErrors, formatMoney } from './format';
import type { CheckoutLink, CreateStaffBookingInput, OfflinePaymentMethod, StaffQuote, StaffQuoteParams } from './types';
import { useCreateStaffBooking, useStaffQuote } from './use-staff-bookings';

type StaffBookingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  units: CalendarUnitRow[];
  today: string;
  /** Pre-filled from nights picked on the calendar. */
  initial?: NightSelection | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{6,24}$/;

type FormErrors = Partial<Record<string, string>>;

/** Waits until the value stops changing, so typing a discount doesn't fire a quote per key. */
function useDebounced<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Staff book for a walk-in or phone guest: record a payment received, or email a payment link. */
export function StaffBookingForm({ isOpen, onClose, units, today, initial }: StaffBookingFormProps) {
  const toast = useToast();
  const create = useCreateStaffBooking();
  const [unitId, setUnitId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [guest, setGuest] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [specialRequests, setSpecialRequests] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [mode, setMode] = useState<'offline' | 'link'>('offline');
  const [method, setMethod] = useState<OfflinePaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [link, setLink] = useState<{ checkout: CheckoutLink; email: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setUnitId(initial?.unitId ?? units[0]?.id ?? '');
    setCheckIn(initial?.startDate ?? '');
    setCheckOut(initial?.endDate ?? '');
    setAdults(1);
    setChildren(0);
    setInfants(0);
    setGuest({ firstName: '', lastName: '', email: '', phone: '' });
    setSpecialRequests('');
    setDiscountAmount('');
    setDiscountReason('');
    setMode('offline');
    setMethod('bank_transfer');
    setReference('');
    setSubmitted(false);
    setLink(null);
    create.reset();
    // Reset only when the form opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const discount = Number(discountAmount) > 0 ? Number(discountAmount) : undefined;
  const quoteParams: StaffQuoteParams | null =
    isOpen && unitId && checkIn && checkOut > checkIn && adults >= 1
      ? { unitId, checkIn, checkOut, adults, children, infants, discount }
      : null;
  const quote = useStaffQuote(useDebounced(quoteParams));
  const unit = units.find((item) => item.id === unitId) ?? null;

  const errors = useMemo(() => {
    const found: FormErrors = {};
    if (!unitId) found.unitId = 'Choose a unit.';
    if (!checkIn) found.checkIn = 'Choose the check-in day.';
    else if (checkIn < today) found.checkIn = 'Check-in cannot be in the past.';
    if (!checkOut || checkOut <= checkIn) found.checkOut = 'Check-out must be after check-in.';
    if (!guest.firstName.trim()) found.firstName = 'Enter the first name.';
    if (!guest.lastName.trim()) found.lastName = 'Enter the last name.';
    if (!EMAIL_PATTERN.test(guest.email.trim())) found.email = 'The confirmation is emailed, so enter a valid email.';
    if (!PHONE_PATTERN.test(guest.phone.trim())) found.phone = 'Enter a valid phone number.';
    if (discount && !discountReason.trim()) found.discountReason = 'Say why you are giving a discount.';
    return found;
  }, [unitId, checkIn, checkOut, today, guest, discount, discountReason]);

  const apiErrors = fieldErrors(create.error);
  const show = (field: string) => (submitted ? errors[field] : undefined) ?? apiErrors[field] ?? apiErrors[`guest.${field}`];

  const submit = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    const input: CreateStaffBookingInput = {
      unitId,
      checkIn,
      checkOut,
      adults,
      children,
      infants,
      guest: {
        firstName: guest.firstName.trim(),
        lastName: guest.lastName.trim(),
        email: guest.email.trim(),
        phone: guest.phone.trim(),
      },
      specialRequests: specialRequests.trim() || null,
      ...(discount ? { discount: { amount: discount, reason: discountReason.trim() } } : {}),
      payment: mode === 'offline' ? { mode, method, reference: reference.trim() || null } : { mode },
    };
    try {
      const created = await create.mutateAsync(input);
      if (created.checkout) {
        setLink({ checkout: created.checkout, email: input.guest.email });
      } else {
        toast({ status: 'success', title: `Booking ${created.booking.reference} confirmed` });
        onClose();
      }
    } catch {
      // Shown in the form.
    }
  };

  if (link) {
    return <PaymentLinkSent isOpen={isOpen} onClose={onClose} checkout={link.checkout} email={link.email} />;
  }

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="New booking"
      size="3xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} isLoading={create.isPending}>
            {mode === 'offline' ? 'Confirm booking' : 'Send payment link'}
          </Button>
        </>
      }
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="14px" mb="14px">
        <FormControl isInvalid={Boolean(show('unitId'))}>
          <FormLabel>Unit</FormLabel>
          <Select aria-label="Unit" value={unitId} onChange={(event) => setUnitId(event.target.value)}>
            {units.map((item) => (
              <option key={item.id} value={item.id}>
                {item.propertyName ? `${item.propertyName} · ${item.name}` : item.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{show('unitId')}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(show('checkIn'))}>
          <FormLabel>Check-in</FormLabel>
          <Input type="date" aria-label="Check-in" min={today} value={checkIn} onChange={(event) => setCheckIn(event.target.value)} />
          <FormErrorMessage>{show('checkIn')}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(show('checkOut'))}>
          <FormLabel>Check-out</FormLabel>
          <Input type="date" aria-label="Check-out" min={checkIn || today} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
          <FormErrorMessage>{show('checkOut')}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      <SimpleGrid columns={3} gap="14px" mb="14px">
        <CountField label="Adults" min={1} value={adults} onChange={setAdults} error={show('adults')} />
        <CountField label="Children" min={0} value={children} onChange={setChildren} />
        <CountField label="Infants" min={0} value={infants} onChange={setInfants} hint="Under 2; not counted" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px" mb="14px">
        {(
          [
            ['firstName', 'First name'],
            ['lastName', 'Last name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
          ] as const
        ).map(([field, label]) => (
          <FormControl key={field} isInvalid={Boolean(show(field))}>
            <FormLabel>{label}</FormLabel>
            <Input
              aria-label={label}
              type={field === 'email' ? 'email' : 'text'}
              value={guest[field]}
              onChange={(event) => setGuest((current) => ({ ...current, [field]: event.target.value }))}
            />
            <FormErrorMessage>{show(field)}</FormErrorMessage>
          </FormControl>
        ))}
      </SimpleGrid>

      <FormControl mb="14px">
        <FormLabel>Special requests</FormLabel>
        <Textarea aria-label="Special requests" maxLength={1000} value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} />
      </FormControl>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px" mb="14px">
        <FormControl>
          <FormLabel>Discount (₦, optional)</FormLabel>
          <Input aria-label="Discount amount" type="number" min={0} step="0.01" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} />
          <FormHelperText>Comes off the nights, before tax.</FormHelperText>
        </FormControl>
        <FormControl isInvalid={Boolean(show('discountReason'))}>
          <FormLabel>Discount reason</FormLabel>
          <Input aria-label="Discount reason" maxLength={200} value={discountReason} onChange={(event) => setDiscountReason(event.target.value)} isDisabled={!discount} />
          <FormErrorMessage>{show('discountReason')}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>

      <QuoteSummary quote={quote.data ?? null} isLoading={quote.isFetching && !quote.data} error={quote.error} unit={unit} />

      <FormControl mt="16px">
        <FormLabel>Payment</FormLabel>
        <RadioGroup value={mode} onChange={(value) => setMode(value as 'offline' | 'link')}>
          <Stack direction={{ base: 'column', md: 'row' }} gap="16px">
            <Radio value="offline">Payment received (cash, transfer, POS)</Radio>
            <Radio value="link">Email the guest a payment link</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      {mode === 'offline' ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px" mt="12px">
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
        </SimpleGrid>
      ) : (
        <Text mt="10px" fontSize="14px" color="ink.400">
          The guest gets an email with a Flutterwave link and has 24 hours to pay. The dates are held until then.
        </Text>
      )}

      {create.error && !Object.keys(apiErrors).length ? (
        <Text mt="12px" color="status.danger" fontSize="14px" role="alert">
          {bookingErrorMessage(create.error)}
        </Text>
      ) : null}
    </AppModal>
  );
}

function CountField({
  label,
  min,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  min: number;
  value: number;
  onChange: (value: number) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <FormControl isInvalid={Boolean(error)}>
      <FormLabel>{label}</FormLabel>
      <Input
        aria-label={label}
        type="number"
        min={min}
        max={50}
        value={value}
        onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))}
      />
      {hint ? <FormHelperText>{hint}</FormHelperText> : null}
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}

function QuoteSummary({
  quote,
  isLoading,
  error,
  unit,
}: {
  quote: StaffQuote | null;
  isLoading: boolean;
  error: unknown;
  unit: CalendarUnitRow | null;
}) {
  if (isLoading) return <Skeleton h="120px" borderRadius="14px" />;
  if (error) {
    return (
      <Text color="status.danger" fontSize="14px" role="alert">
        {bookingErrorMessage(error)}
      </Text>
    );
  }
  if (!quote) {
    return (
      <Text fontSize="14px" color="ink.400">
        Pick a unit and dates to see the price.
      </Text>
    );
  }
  const money = (amount: string) => formatMoney(amount, quote.currency);
  const { price } = quote;
  return (
    <Box borderRadius="14px" bg="bg.400" px="14px" data-testid="staff-quote">
      <KeyValueList
        title={`Price${unit ? ` · ${unit.name}` : ''}`}
        items={[
          { label: `${price.nights} night${price.nights === 1 ? '' : 's'}`, value: money(price.nightsSubtotal) },
          ...(price.discount ? [{ label: `${price.discount.kind === 'weekly' ? 'Weekly' : 'Monthly'} discount`, value: `-${money(price.discount.amount)}` }] : []),
          ...(price.staffDiscount ? [{ label: 'Staff discount', value: `-${money(price.staffDiscount.amount)}` }] : []),
          ...(Number(price.cleaningFee) > 0 ? [{ label: 'Cleaning fee', value: money(price.cleaningFee) }] : []),
          ...(Number(price.serviceFee.amount) > 0 ? [{ label: 'Service fee', value: money(price.serviceFee.amount) }] : []),
          ...(Number(price.tax.amount) > 0 ? [{ label: `${price.tax.name} (${price.tax.percent}%)`, value: money(price.tax.amount) }] : []),
          { label: 'Stay total', value: money(price.total) },
          { label: 'Refundable deposit', value: money(quote.deposit.amount) },
          { label: 'Total due', value: money(quote.totalDueNow), emphasize: true },
        ]}
      />
    </Box>
  );
}

function PaymentLinkSent({
  isOpen,
  onClose,
  checkout,
  email,
}: {
  isOpen: boolean;
  onClose: () => void;
  checkout: CheckoutLink;
  email: string;
}) {
  const { onCopy, hasCopied } = useClipboard(checkout.checkoutUrl);
  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Payment link sent" footer={<Button onClick={onClose}>Done</Button>}>
      <Text mb="12px">
        We emailed the payment link to <b>{email}</b>. The dates are held until{' '}
        {new Date(checkout.expiresAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })}.
      </Text>
      <Flex gap="8px" align="center">
        <Input aria-label="Payment link" value={checkout.checkoutUrl} isReadOnly />
        <Button variant="secondary" onClick={onCopy} flexShrink={0}>
          {hasCopied ? 'Copied' : 'Copy link'}
        </Button>
      </Flex>
    </AppModal>
  );
}
