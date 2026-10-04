'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Select,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { LuArrowLeft, LuMenu } from 'react-icons/lu';
import { useCreateReservation } from '@/features/bookings/hooks/use-booking-mutations';
import {
  createEmptyBookingForm,
  estimateBookingQuote,
  formatQuoteLine,
  nightsBetween,
  validateBookingForm,
  type BookingFormErrors,
  type BookingFormValues,
} from '@/features/bookings/utils/booking-form';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useProperties } from '@/features/properties/hooks/use-properties';
import { useUnits } from '@/features/units/hooks/use-units';
import {
  ErrorState,
  PageHeader,
  PageSkeleton,
  Panel,
  StatusBadge,
} from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

export function BookingFormPage() {
  const router = useRouter();
  const toast = useToast();
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const createMutation = useCreateReservation();

  const {
    data: properties = [],
    isLoading: propertiesLoading,
    isError: propertiesError,
    error: propertiesErrorValue,
    refetch: refetchProperties,
  } = useProperties();
  const {
    data: units = [],
    isLoading: unitsLoading,
    isError: unitsError,
    error: unitsErrorValue,
    refetch: refetchUnits,
  } = useUnits();
  const {
    data: customers = [],
    isLoading: customersLoading,
    isError: customersError,
    error: customersErrorValue,
    refetch: refetchCustomers,
  } = useCustomers();

  const [values, setValues] = useState<BookingFormValues>(createEmptyBookingForm);
  const [errors, setErrors] = useState<BookingFormErrors>({});
  const [customerSearch, setCustomerSearch] = useState('');

  const property = useMemo(() => {
    if (values.property_id === '') return null;
    return properties.find((item) => item.id === values.property_id) ?? null;
  }, [properties, values.property_id]);

  const availableUnits = useMemo(() => {
    if (values.property_id === '') return [];
    const propertyId = String(values.property_id);
    return units.filter(
      (item) =>
        item.property_id === propertyId &&
        item.bookable &&
        item.status !== 'inactive',
    );
  }, [units, values.property_id]);

  const unit = useMemo(() => {
    if (values.unit_id === '') return null;
    return availableUnits.find((item) => item.id === values.unit_id) ?? null;
  }, [availableUnits, values.unit_id]);

  const selectedCustomer = useMemo(() => {
    if (values.guest_mode !== 'existing' || !values.guest_id) return null;
    return customers.find((item) => item.id === values.guest_id) ?? null;
  }, [customers, values.guest_id, values.guest_mode]);

  const filteredCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase();
    if (!query) return customers;
    return customers.filter((customer) => {
      const haystack = [
        customer.fullName,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [customerSearch, customers]);

  const quote = useMemo(
    () => estimateBookingQuote(values, unit, property),
    [property, unit, values],
  );

  const guestLabel =
    values.guest_mode === 'existing'
      ? selectedCustomer?.fullName ?? 'Select a customer'
      : [values.first_name, values.last_name].filter(Boolean).join(' ') ||
        'New guest details';

  const isLoading = propertiesLoading || unitsLoading || customersLoading;
  const isSaving = createMutation.isPending;

  const updateField = <K extends keyof BookingFormValues>(
    key: K,
    value: BookingFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const goBack = () => {
    router.push('/bookings');
  };

  const handleSubmit = async () => {
    const nextErrors = validateBookingForm(values, { unit, property });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast({
        title: 'Please fix the highlighted fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await createMutation.mutateAsync(values);
      toast({
        title: 'Booking created',
        description: `${response.data.platform_id} · ${guestLabel}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push('/bookings');
    } catch (error) {
      toast({
        title: 'Could not create booking',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <PageSkeleton variant="form" />;
  }

  if (propertiesError || unitsError || customersError) {
    return (
      <ErrorState
        message={
          (propertiesErrorValue instanceof Error && propertiesErrorValue.message) ||
          (unitsErrorValue instanceof Error && unitsErrorValue.message) ||
          (customersErrorValue instanceof Error && customersErrorValue.message) ||
          'Failed to load booking form data'
        }
        onRetry={() => {
          void refetchProperties();
          void refetchUnits();
          void refetchCustomers();
        }}
      />
    );
  }

  if (properties.length === 0) {
    return (
      <ErrorState
        title="No properties yet"
        message="Create a property before booking on behalf of a guest."
        onRetry={() => router.push('/properties/new')}
        retryLabel="Add property"
      />
    );
  }

  return (
    <Box maxW="980px">
      <PageHeader
        title="Add booking"
        description="Create a reservation on behalf of a guest or existing customer."
        actions={
          <>
            <IconButton
              aria-label="Open navigation"
              icon={<LuMenu size={20} />}
              display={{ base: 'inline-flex', lg: 'none' }}
              variant="secondary"
              borderRadius="12px"
              h="44px"
              w="44px"
              onClick={openMobileNav}
            />
            <Button
              variant="secondary"
              leftIcon={<LuArrowLeft size={16} />}
              borderRadius="12px"
              h="44px"
              onClick={goBack}
              isDisabled={isSaving}
            >
              Back
            </Button>
            <Button
              h="44px"
              borderRadius="12px"
              onClick={() => void handleSubmit()}
              isLoading={isSaving}
              loadingText="Creating"
            >
              Create booking
            </Button>
          </>
        }
      />

      <Grid
        templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 300px' }}
        gap="16px"
        alignItems="start"
      >
        <Panel>
          <Flex direction="column" gap="22px">
            <Section title="Guest">
              <Flex gap="8px" mb="14px" wrap="wrap">
                <Button
                  size="sm"
                  variant={values.guest_mode === 'existing' ? 'dark' : 'soft'}
                  onClick={() => {
                    setValues((current) => ({
                      ...current,
                      guest_mode: 'existing',
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                    }));
                    setErrors((current) => {
                      const next = { ...current };
                      delete next.first_name;
                      delete next.last_name;
                      delete next.email;
                      delete next.guest_id;
                      return next;
                    });
                  }}
                >
                  Existing customer
                </Button>
                <Button
                  size="sm"
                  variant={values.guest_mode === 'new' ? 'dark' : 'soft'}
                  onClick={() => {
                    setValues((current) => ({
                      ...current,
                      guest_mode: 'new',
                      guest_id: '',
                    }));
                    setErrors((current) => {
                      const next = { ...current };
                      delete next.guest_id;
                      return next;
                    });
                  }}
                >
                  New guest
                </Button>
              </Flex>

              {values.guest_mode === 'existing' ? (
                <Grid
                  templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                  gap="14px"
                >
                  <Field label="Search customers">
                    <Input
                      value={customerSearch}
                      onChange={(event) => setCustomerSearch(event.target.value)}
                      placeholder="Name, email, phone…"
                      {...inputProps}
                    />
                  </Field>
                  <Field label="Customer" isRequired error={errors.guest_id}>
                    <Select
                      value={values.guest_id}
                      onChange={(event) =>
                        updateField('guest_id', event.target.value)
                      }
                      {...inputProps}
                    >
                      <option value="" disabled>
                        Select customer
                      </option>
                      {filteredCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.fullName}
                          {customer.email ? ` · ${customer.email}` : ''}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </Grid>
              ) : (
                <Grid
                  templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                  gap="14px"
                >
                  <Field
                    label="First name"
                    isRequired
                    error={errors.first_name}
                  >
                    <Input
                      value={values.first_name}
                      onChange={(event) =>
                        updateField('first_name', event.target.value)
                      }
                      {...inputProps}
                    />
                  </Field>
                  <Field label="Last name" isRequired error={errors.last_name}>
                    <Input
                      value={values.last_name}
                      onChange={(event) =>
                        updateField('last_name', event.target.value)
                      }
                      {...inputProps}
                    />
                  </Field>
                  <Field label="Email" isRequired error={errors.email}>
                    <Input
                      type="email"
                      value={values.email}
                      onChange={(event) =>
                        updateField('email', event.target.value)
                      }
                      {...inputProps}
                    />
                  </Field>
                  <Field label="Phone">
                    <Input
                      value={values.phone}
                      onChange={(event) =>
                        updateField('phone', event.target.value)
                      }
                      placeholder="+234…"
                      {...inputProps}
                    />
                  </Field>
                </Grid>
              )}
            </Section>

            <Section title="Stay">
              <Grid
                templateColumns={{ base: '1fr', md: '1fr 1fr' }}
                gap="14px"
              >
                <Field label="Property" isRequired error={errors.property_id}>
                  <Select
                    value={
                      values.property_id === ''
                        ? ''
                        : String(values.property_id)
                    }
                    onChange={(event) => {
                      const nextId = event.target.value;
                      setValues((current) => ({
                        ...current,
                        property_id: nextId,
                        unit_id: '',
                      }));
                      setErrors((current) => {
                        const next = { ...current };
                        delete next.property_id;
                        delete next.unit_id;
                        return next;
                      });
                    }}
                    {...inputProps}
                  >
                    <option value="" disabled>
                      Select property
                    </option>
                    {properties.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Unit"
                  isRequired
                  error={errors.unit_id}
                  helper={
                    values.property_id === ''
                      ? 'Choose a property first'
                      : availableUnits.length === 0
                        ? 'No bookable units for this property'
                        : unit
                          ? `Sleeps ${unit.capacity}`
                          : undefined
                  }
                >
                  <Select
                    value={values.unit_id === '' ? '' : String(values.unit_id)}
                    onChange={(event) =>
                      updateField('unit_id', event.target.value || '')
                    }
                    isDisabled={values.property_id === ''}
                    {...inputProps}
                  >
                    <option value="" disabled>
                      Select unit
                    </option>
                    {availableUnits.map((item) => (
                      <option key={item.id} value={String(item.id)}>
                        {item.name} · {item.code}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Check-in"
                  isRequired
                  error={errors.arrival_date}
                >
                  <Input
                    type="date"
                    value={values.arrival_date}
                    onChange={(event) =>
                      updateField('arrival_date', event.target.value)
                    }
                    {...inputProps}
                  />
                </Field>
                <Field
                  label="Checkout"
                  isRequired
                  error={errors.departure_date}
                  helper={
                    quote.nights > 0
                      ? `${quote.nights} night${quote.nights === 1 ? '' : 's'}`
                      : undefined
                  }
                >
                  <Input
                    type="date"
                    value={values.departure_date}
                    min={values.arrival_date || undefined}
                    onChange={(event) =>
                      updateField('departure_date', event.target.value)
                    }
                    {...inputProps}
                  />
                </Field>
              </Grid>
            </Section>

            <Section title="Guests">
              <Grid
                templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }}
                gap="14px"
              >
                <Field label="Adults" isRequired error={errors.adult_count}>
                  <Input
                    type="number"
                    min={1}
                    value={values.adult_count}
                    onChange={(event) =>
                      updateField('adult_count', Number(event.target.value))
                    }
                    {...inputProps}
                  />
                </Field>
                <Field label="Children" error={errors.child_count}>
                  <Input
                    type="number"
                    min={0}
                    value={values.child_count}
                    onChange={(event) =>
                      updateField('child_count', Number(event.target.value))
                    }
                    {...inputProps}
                  />
                </Field>
                <Field label="Infants" error={errors.infant_count}>
                  <Input
                    type="number"
                    min={0}
                    value={values.infant_count}
                    onChange={(event) =>
                      updateField('infant_count', Number(event.target.value))
                    }
                    {...inputProps}
                  />
                </Field>
                <Field label="Pets" error={errors.pet_count}>
                  <Input
                    type="number"
                    min={0}
                    value={values.pet_count}
                    onChange={(event) =>
                      updateField('pet_count', Number(event.target.value))
                    }
                    {...inputProps}
                  />
                </Field>
              </Grid>
            </Section>

            <Section title="Payment">
              <Flex gap="8px" mb="14px" wrap="wrap">
                <Button
                  size="sm"
                  variant={
                    values.payment_status === 'confirmed' ? 'dark' : 'soft'
                  }
                  onClick={() => updateField('payment_status', 'confirmed')}
                >
                  Mark as paid
                </Button>
                <Button
                  size="sm"
                  variant={
                    values.payment_status === 'awaiting_payment'
                      ? 'dark'
                      : 'soft'
                  }
                  onClick={() =>
                    updateField('payment_status', 'awaiting_payment')
                  }
                >
                  Awaiting payment
                </Button>
              </Flex>
              <Field label="Internal notes">
                <Textarea
                  value={values.notes}
                  onChange={(event) => updateField('notes', event.target.value)}
                  placeholder="Reason for admin booking, special requests…"
                  minH="80px"
                  borderColor="line.500"
                  borderRadius="12px"
                />
              </Field>
            </Section>

            <Flex
              gap="10px"
              justify="flex-end"
              wrap="wrap"
              pt="8px"
              borderTop="1px solid"
              borderColor="line.500"
            >
              <Button
                variant="secondary"
                borderRadius="12px"
                onClick={goBack}
                isDisabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                borderRadius="12px"
                onClick={() => void handleSubmit()}
                isLoading={isSaving}
                loadingText="Creating"
              >
                Create booking
              </Button>
            </Flex>
          </Flex>
        </Panel>

        <Box
          position={{ lg: 'sticky' }}
          top={{ lg: '24px' }}
          border="1px solid"
          borderColor="line.500"
          borderRadius="16px"
          bg="white"
          p="16px"
        >
          <Text
            fontSize="12px"
            fontWeight={800}
            textTransform="uppercase"
            letterSpacing="0.05em"
            color="ink.300"
            mb="12px"
          >
            Live summary
          </Text>

          <Flex direction="column" gap="12px">
            <SummaryRow label="Guest" value={guestLabel} />
            <SummaryRow
              label="Property"
              value={property?.name ?? 'Not selected'}
            />
            <SummaryRow
              label="Unit"
              value={
                unit
                  ? `${unit.name} · sleeps ${unit.capacity}`
                  : 'Not selected'
              }
            />
            <SummaryRow
              label="Dates"
              value={
                values.arrival_date && values.departure_date
                  ? `${values.arrival_date} → ${values.departure_date}`
                  : 'Pick stay dates'
              }
            />
            <SummaryRow
              label="Nights"
              value={
                quote.nights > 0
                  ? String(quote.nights)
                  : String(
                      nightsBetween(values.arrival_date, values.departure_date) ||
                        '—',
                    )
              }
            />
            <SummaryRow
              label="Payment"
              value={
                values.payment_status === 'confirmed'
                  ? 'Confirmed / paid'
                  : 'Awaiting payment'
              }
            />

            <Box
              borderTop="1px solid"
              borderColor="line.500"
              pt="12px"
              mt="4px"
            >
              <Flex justify="space-between" mb="6px">
                <Text fontSize="13px" color="ink.300">
                  Accommodation
                </Text>
                <Text fontSize="13px" fontWeight={600}>
                  {quote.nights > 0
                    ? formatQuoteLine(quote.accommodation, quote.currency)
                    : '—'}
                </Text>
              </Flex>
              <Flex justify="space-between" mb="10px">
                <Text fontSize="13px" color="ink.300">
                  Cleaning
                </Text>
                <Text fontSize="13px" fontWeight={600}>
                  {quote.nights > 0
                    ? formatQuoteLine(quote.cleaningFee, quote.currency)
                    : '—'}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="14px" fontWeight={800}>
                  Total
                </Text>
                <Text fontSize="18px" fontWeight={800}>
                  {quote.nights > 0
                    ? formatQuoteLine(quote.total, quote.currency)
                    : '—'}
                </Text>
              </Flex>
              {quote.nightlyRate > 0 ? (
                <Text fontSize="12px" color="ink.300" mt="8px">
                  {formatQuoteLine(quote.nightlyRate, quote.currency)} / night
                </Text>
              ) : null}
            </Box>

            <StatusBadge
              tone={
                values.payment_status === 'confirmed' ? 'ok' : 'warn'
              }
              alignSelf="flex-start"
            >
              Direct · Admin booking
            </StatusBadge>
          </Flex>
        </Box>
      </Grid>
    </Box>
  );
}

const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '40px',
  bg: 'white',
} as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="12px"
        fontWeight={800}
        textTransform="uppercase"
        letterSpacing="0.05em"
        color="ink.300"
        mb="12px"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function Field({
  label,
  children,
  error,
  helper,
  isRequired,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  helper?: string;
  isRequired?: boolean;
}) {
  return (
    <FormControl isInvalid={Boolean(error)} isRequired={isRequired}>
      <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
        {label}
      </FormLabel>
      {children}
      {helper && !error ? (
        <FormHelperText color="ink.300">{helper}</FormHelperText>
      ) : null}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Text fontSize="11px" color="ink.300" fontWeight={700} textTransform="uppercase">
        {label}
      </Text>
      <Text fontSize="14px" fontWeight={600} mt="2px" noOfLines={2}>
        {value}
      </Text>
    </Box>
  );
}
