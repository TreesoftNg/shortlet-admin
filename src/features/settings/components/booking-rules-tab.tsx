'use client';

import { Alert, AlertIcon, Flex, Switch, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ErrorState, FormPanel, FormRow, PageSkeleton } from '@/shared/components/ui';
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
import { apiFieldErrors, SaveBar, UnitInput, useSettingsToasts } from './settings-form-parts';

/** Base rate used for the deposit example. */
const EXAMPLE_NIGHTLY_RATE = 50_000;

const naira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
const unitWord = (count: string | number, word: string) => (Number(count) === 1 ? word : `${word}s`);
const ruleId = (field: keyof BookingRules) => `booking-rule-${field}`;

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
  if (isError || !values || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load booking rules'}
        onRetry={() => void refetch()}
      />
    );
  }

  const ruleInput = (field: keyof BookingRules, label: string, unit: string) => (
    <UnitInput
      id={ruleId(field)}
      label={label}
      unit={unitWord(values[field], unit)}
      min={RULE_LIMITS[field].min}
      max={RULE_LIMITS[field].max}
      value={values[field]}
      onChange={(event) => setValues((current) => (current ? { ...current, [field]: event.target.value } : current))}
      isReadOnly={!canManage}
      isInvalid={Boolean(errors[field])}
    />
  );

  const toSave = applyDepositSwitches(values, switches);
  const isDirty = JSON.stringify(toSave) !== JSON.stringify(rulesToForm(data));
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
    <Flex direction="column" gap="20px">
      <Alert status="info" borderRadius="12px" fontSize="14px">
        <AlertIcon />
        Changes apply to new bookings only. Existing bookings keep the deposit and hold they were made with.
      </Alert>

      <FormPanel
        title="Holding dates while guests pay"
        description="Dates are kept for the guest while they pay, then released if they don't."
      >
        <FormRow
          label="Website bookings"
          labelFor={ruleId('paymentHoldMinutes')}
          description="How long a guest booking on the website has to pay (5–60 minutes)."
          error={errors.paymentHoldMinutes}
        >
          {ruleInput('paymentHoldMinutes', 'Website payment hold (minutes)', 'minute')}
        </FormRow>
        <FormRow
          label="Payment links"
          labelFor={ruleId('staffLinkHoldHours')}
          description="How long a guest has to pay a link emailed by staff (1–24 hours)."
          error={errors.staffLinkHoldHours}
        >
          {ruleInput('staffLinkHoldHours', 'Payment link hold (hours)', 'hour')}
        </FormRow>
      </FormPanel>

      <FormPanel
        title="Security deposit"
        footer={
          switches.chargeDeposit && rules && example ? (
            <Flex
              gap={{ base: '4px', md: '24px' }}
              direction={{ base: 'column', md: 'row' }}
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
          ) : undefined
        }
      >
        <FormRow
          label="Charge a security deposit"
          labelFor="charge-deposit"
          description="A refundable amount taken with each booking to cover damage."
          isInline
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
        </FormRow>

        {switches.chargeDeposit ? (
          <>
            <FormRow
              label="Standard deposit"
              labelFor={ruleId('depositNights')}
              description="Nights of the unit's base nightly rate, charged on every booking."
              error={errors.depositNights}
            >
              {ruleInput('depositNights', 'Deposit (nights)', 'night')}
            </FormRow>

            <FormRow
              label="Different deposit for long stays"
              labelFor="long-stay-deposit"
              description="Charge a different deposit when a stay reaches a set length."
              isInline
            >
              <Switch
                id="long-stay-deposit"
                colorScheme="green"
                isChecked={switches.longStayDeposit}
                isDisabled={!canManage}
                onChange={(event) => setSwitches((current) => ({ ...current, longStayDeposit: event.target.checked }))}
              />
            </FormRow>

            {switches.longStayDeposit ? (
              <>
                <FormRow
                  label="Long stays start at"
                  labelFor={ruleId('longStayMinNights')}
                  description="Stays of this many nights or more count as long stays."
                  error={errors.longStayMinNights}
                  nested
                >
                  {ruleInput('longStayMinNights', 'Long stays from (nights)', 'night')}
                </FormRow>
                <FormRow
                  label="Long-stay deposit"
                  labelFor={ruleId('longStayDepositNights')}
                  description="Charged instead of the standard deposit."
                  error={errors.longStayDepositNights}
                  nested
                >
                  {ruleInput('longStayDepositNights', 'Long-stay deposit (nights)', 'night')}
                </FormRow>
              </>
            ) : null}
          </>
        ) : null}
      </FormPanel>

      <FormPanel
        title="Returning the deposit"
        description="Staff decide how much to return. The system never returns it on its own."
      >
        <FormRow
          label="Return within"
          labelFor={ruleId('depositReleaseHours')}
          description="Hours after check-out. Staff are reminded, and alerted when it is overdue (1–168)."
          error={errors.depositReleaseHours}
        >
          {ruleInput('depositReleaseHours', 'Release within (hours of check-out)', 'hour')}
        </FormRow>
      </FormPanel>

      <SaveBar canManage={canManage} isSaving={update.isPending} isDirty={isDirty} onSave={() => void save()} />
    </Flex>
  );
}
