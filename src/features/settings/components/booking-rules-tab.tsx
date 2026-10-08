'use client';

import { Alert, AlertIcon, Flex, Input, SimpleGrid, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ErrorState, PageSkeleton } from '@/shared/components/ui';
import { useBookingSettings, useUpdateBookingSettings } from '../hooks/use-business-settings';
import type { BookingRules } from '../types';
import {
  describeDepositRule,
  type FormErrors,
  formToRules,
  RULE_LIMITS,
  rulesToForm,
  type RulesFormValues,
  validateRules,
} from '../utils/settings-forms';
import { apiFieldErrors, Field, inputProps, SaveBar, Section, useSettingsToasts } from './settings-form-parts';

/** Payment holds and security-deposit rules. */
export function BookingRulesTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = useBookingSettings();
  const update = useUpdateBookingSettings();
  const toasts = useSettingsToasts();
  const [values, setValues] = useState<RulesFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors<RulesFormValues>>({});

  useEffect(() => {
    if (data) setValues(rulesToForm(data));
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
        onChange={(event) => setValues((current) => (current ? { ...current, [field]: event.target.value } : current))}
        isReadOnly={!canManage}
      />
    </Field>
  );
  const valid = Object.keys(validateRules(values)).length === 0;

  const save = async () => {
    const found = validateRules(values);
    setErrors(found);
    if (Object.keys(found).length) {
      toasts.invalid();
      return;
    }
    try {
      setValues(rulesToForm(await update.mutateAsync(formToRules(values))));
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

      <Section
        title="Security deposit"
        description="Charged with the booking at the unit's base nightly rate, and returned by staff after check-out."
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="16px" mb="12px">
          {number('depositNights', 'Deposit (nights)', '0 for no deposit (0–7).')}
          {number('longStayMinNights', 'Long stays from (nights)')}
          {number('longStayDepositNights', 'Long-stay deposit (nights)')}
        </SimpleGrid>
        {valid ? (
          <Text fontSize="14px" color="ink.400" data-testid="deposit-rule">
            {describeDepositRule(formToRules(values))}.
          </Text>
        ) : null}
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
