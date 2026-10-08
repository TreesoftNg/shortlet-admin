'use client';

import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightAddon,
  SimpleGrid,
  Switch,
  Text,
} from '@chakra-ui/react';
import { type ReactNode, useEffect, useState } from 'react';
import { ErrorState, PageSkeleton } from '@/shared/components/ui';
import { useBookingSettings, useUpdateBookingSettings } from '../hooks/use-business-settings';
import type { BookingRules } from '../types';
import {
  applyDepositSwitches,
  depositExampleStays,
  type DepositSwitches,
  depositSwitches,
  type FormErrors,
  formToRules,
  RULE_LIMITS,
  rulesToForm,
  type RulesFormValues,
  validateRules,
} from '../utils/settings-forms';
import { apiFieldErrors, Field, inputProps, SaveBar, Section, useSettingsToasts } from './settings-form-parts';

/** Base rate used for the deposit example. */
const EXAMPLE_NIGHTLY_RATE = 50_000;

const naira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const nightsWord = (count: string | number) => (Number(count) === 1 ? 'night' : 'nights');

/** Payment holds and security-deposit rules. */
export function BookingRulesTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = useBookingSettings();
  const update = useUpdateBookingSettings();
  const toasts = useSettingsToasts();
  const [values, setValues] = useState<RulesFormValues | null>(null);
  const [switches, setSwitches] = useState<DepositSwitches>({ chargeDeposit: true, longStayDeposit: true });
  const [errors, setErrors] = useState<FormErrors<RulesFormValues>>({});

  useEffect(() => {
    if (!data) return;
    setValues(rulesToForm(data));
    setSwitches(depositSwitches(data));
  }, [data]);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !values) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load booking rules'}
        onRetry={() => void refetch()}
      />
    );
  }

  const setField = (field: keyof BookingRules, value: string) =>
    setValues((current) => (current ? { ...current, [field]: value } : current));

  const number = (field: keyof BookingRules, label: string, helper?: string) => (
    <Field label={label} error={errors[field]} helper={helper ?? `${RULE_LIMITS[field].min}–${RULE_LIMITS[field].max}`}>
      <Input
        aria-label={label}
        type="number"
        min={RULE_LIMITS[field].min}
        max={RULE_LIMITS[field].max}
        step={1}
        {...inputProps}
        value={values[field]}
        onChange={(event) => setField(field, event.target.value)}
        isReadOnly={!canManage}
      />
    </Field>
  );

  /** A whole number of nights, with the unit shown inside the field. */
  const nightsInput = (field: keyof BookingRules, label: string) => (
    <InputGroup w={{ base: '100%', md: '148px' }} flexShrink={0}>
      <Input
        id={`booking-rule-${field}`}
        aria-label={label}
        type="number"
        inputMode="numeric"
        min={RULE_LIMITS[field].min}
        max={RULE_LIMITS[field].max}
        step={1}
        value={values[field]}
        onChange={(event) => setField(field, event.target.value)}
        isReadOnly={!canManage}
        isInvalid={Boolean(errors[field])}
        h="40px"
        borderColor="line.500"
        borderRadius="10px"
        bg="white"
      />
      <InputRightAddon
        h="40px"
        minW="64px"
        justifyContent="center"
        borderColor="line.500"
        borderLeftWidth={0}
        borderRadius="0 10px 10px 0"
        bg="bg.400"
        color="ink.300"
        fontSize="13px"
      >
        {nightsWord(values[field])}
      </InputRightAddon>
    </InputGroup>
  );

  const toSave = applyDepositSwitches(values, switches);
  const found = validateRules(toSave);
  const rules = Object.keys(found).length ? null : formToRules(toSave);
  const example = rules ? depositExampleStays(rules) : null;
  const depositFor = (nights: number) =>
    rules ? (nights >= rules.longStayMinNights ? rules.longStayDepositNights : rules.depositNights) : 0;

  const save = async () => {
    setErrors(found);
    if (!rules) {
      toasts.invalid();
      return;
    }
    try {
      const saved = await update.mutateAsync(rules);
      setValues(rulesToForm(saved));
      setSwitches(depositSwitches(saved));
      toasts.saved();
    } catch (err) {
      setErrors(apiFieldErrors(err));
      toasts.failed(err);
    }
  };

  return (
    <Flex direction="column" gap="28px">
      <Alert status="info" borderRadius="12px" fontSize="14px">
        <AlertIcon />
        Changes apply to new bookings only. Existing bookings keep the deposit and hold they were made with.
      </Alert>

      <Section title="Holding dates while guests pay">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          {number('paymentHoldMinutes', 'Website payment hold (minutes)', 'Dates are released if the guest has not paid by then (5–60).')}
          {number('staffLinkHoldHours', 'Payment link hold (hours)', 'For payment links staff email to guests (1–24).')}
        </SimpleGrid>
      </Section>

      <Section title="Security deposit">
        <Box border="1px solid" borderColor="line.500" borderRadius="14px" overflow="hidden" bg="white">
          <SettingRow
            label="Charge a security deposit"
            isToggle
            labelFor="charge-deposit"
            description="A refundable amount taken with each booking to cover damage."
          >
            <Switch
              id="charge-deposit"
              colorScheme="green"
              isChecked={switches.chargeDeposit}
              isDisabled={!canManage}
              onChange={(event) => {
                const chargeDeposit = event.target.checked;
                setSwitches((current) => ({ ...current, chargeDeposit }));
                // Turning it back on after it was off starts from one night.
                if (chargeDeposit && Number(values.depositNights) === 0 && Number(values.longStayDepositNights) === 0) {
                  setValues({ ...values, depositNights: '1', longStayDepositNights: '1' });
                }
              }}
            />
          </SettingRow>

          {switches.chargeDeposit ? (
            <>
              <SettingRow
                label="Standard deposit"
                labelFor="booking-rule-depositNights"
                description="Nights of the unit's base nightly rate, charged on every booking."
                error={errors.depositNights}
              >
                {nightsInput('depositNights', 'Deposit (nights)')}
              </SettingRow>

              <SettingRow
                label="Different deposit for long stays"
            isToggle
                labelFor="long-stay-deposit"
                description="Charge a different deposit when a stay reaches a set length."
              >
                <Switch
                  id="long-stay-deposit"
                  colorScheme="green"
                  isChecked={switches.longStayDeposit}
                  isDisabled={!canManage}
                  onChange={(event) => setSwitches((current) => ({ ...current, longStayDeposit: event.target.checked }))}
                />
              </SettingRow>

              {switches.longStayDeposit ? (
                <>
                  <SettingRow
                    label="Long stays start at"
                    labelFor="booking-rule-longStayMinNights"
                    description="Stays of this many nights or more count as long stays."
                    error={errors.longStayMinNights}
                    nested
                  >
                    {nightsInput('longStayMinNights', 'Long stays from (nights)')}
                  </SettingRow>
                  <SettingRow
                    label="Long-stay deposit"
                    labelFor="booking-rule-longStayDepositNights"
                    description="Charged instead of the standard deposit."
                    error={errors.longStayDepositNights}
                    nested
                  >
                    {nightsInput('longStayDepositNights', 'Long-stay deposit (nights)')}
                  </SettingRow>
                </>
              ) : null}

              {rules && example ? (
                <Flex
                  borderTop="1px solid"
                  borderColor="line.500"
                  bg="bg.400"
                  px="18px"
                  py="12px"
                  gap={{ base: '4px', md: '24px' }}
                  direction={{ base: 'column', md: 'row' }}
                  fontSize="13px"
                  color="ink.300"
                  data-testid="deposit-example"
                >
                  <Text>For a unit at {naira(EXAMPLE_NIGHTLY_RATE)} a night:</Text>
                  {[example.short, ...(switches.longStayDeposit ? [example.long] : [])].map((nights) => (
                    <Text key={nights}>
                      {nights}-night stay{' '}
                      <Text as="span" fontWeight={700} color="ink.500">
                        {depositFor(nights) ? `${naira(depositFor(nights) * EXAMPLE_NIGHTLY_RATE)} deposit` : 'no deposit'}
                      </Text>
                    </Text>
                  ))}
                </Flex>
              ) : null}
            </>
          ) : null}
        </Box>
      </Section>

      <Section title="Returning the deposit">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          {number('depositReleaseHours', 'Release within (hours of check-out)', 'Staff are reminded, and alerted when it is overdue (1–168).')}
        </SimpleGrid>
      </Section>

      <SaveBar canManage={canManage} isSaving={update.isPending} onSave={() => void save()} />
    </Flex>
  );
}

/** One setting: label and description on the left, its control on the right. */
function SettingRow({
  label,
  labelFor,
  description,
  error,
  nested,
  isToggle,
  children,
}: {
  label: string;
  labelFor: string;
  description: string;
  error?: string;
  nested?: boolean;
  /** Switches stay beside their label on small screens; inputs drop below it. */
  isToggle?: boolean;
  children: ReactNode;
}) {
  return (
    <Flex
      direction={isToggle ? 'row' : { base: 'column', md: 'row' }}
      align={isToggle ? 'center' : { base: 'stretch', md: 'center' }}
      justify="space-between"
      gap={{ base: '10px', md: '24px' }}
      px="18px"
      py="14px"
      pl={nested ? { base: '18px', md: '34px' } : '18px'}
      borderTop="1px solid"
      borderColor="line.500"
      _first={{ borderTop: 0 }}
    >
      <Box minW={0}>
        <Text as="label" htmlFor={labelFor} display="block" fontSize="14px" fontWeight={600} color="ink.500">
          {label}
        </Text>
        <Text fontSize="13px" color="ink.300" mt="2px">
          {description}
        </Text>
        {error ? (
          <Text fontSize="13px" color="red.500" mt="4px">
            {error}
          </Text>
        ) : null}
      </Box>
      {children}
    </Flex>
  );
}
