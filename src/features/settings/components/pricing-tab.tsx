'use client';

import { Box, Flex, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { apiFieldErrors } from '@/shared/api/field-errors';
import { ErrorState, FormPanel, FormRow, PageSkeleton } from '@/shared/components/ui';
import { usePricingSettings, useUpdatePricingSettings } from '../hooks/use-business-settings';
import {
  type FormErrors,
  formToPricingInput,
  type PricingFormValues,
  pricingExample,
  pricingToForm,
  validatePricing,
} from '../utils/settings-forms';
import { controlProps, SaveBar, UnitInput, useSettingsToasts } from './settings-form-parts';

const EXAMPLE_NIGHTS_KOBO = 10_000_000;
const EXAMPLE_CLEANING_KOBO = 1_000_000;

const naira = (kobo: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(kobo / 100);

/** Service fee and tax added to every stay. */
export function PricingTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = usePricingSettings();
  const update = useUpdatePricingSettings();
  const toasts = useSettingsToasts();
  const [values, setValues] = useState<PricingFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors<PricingFormValues>>({});

  useEffect(() => {
    if (data) setValues(pricingToForm(data));
  }, [data]);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !values || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load pricing settings'}
        onRetry={() => void refetch()}
      />
    );
  }

  const isDirty = JSON.stringify(values) !== JSON.stringify(pricingToForm(data));
  const set = (field: keyof PricingFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => (current ? { ...current, [field]: event.target.value } : current));
  const example = pricingExample(values);

  const save = async () => {
    const found = validatePricing(values);
    setErrors(found);
    if (Object.keys(found).length) {
      toasts.invalid();
      return;
    }
    try {
      setValues(pricingToForm(await update.mutateAsync(formToPricingInput(values))));
      toasts.saved();
    } catch (err) {
      setErrors(apiFieldErrors(err));
      toasts.failed(err);
    }
  };

  return (
    <Flex direction="column" gap="20px">
      <FormPanel
        title="Fees and tax"
        description="Added to every stay. Changes apply to new quotes and bookings only."
        footer={
          example ? (
            <Box w="100%" data-testid="pricing-example">
              <Text fontWeight={600} color="ink.500" mb="6px">
                Example: {naira(EXAMPLE_NIGHTS_KOBO)} of nights and a {naira(EXAMPLE_CLEANING_KOBO)} cleaning fee
              </Text>
              <ExampleLine label="Service fee" amount={naira(example.serviceFee)} />
              <ExampleLine label={values.taxName.trim() || 'Tax'} amount={naira(example.tax)} />
              <ExampleLine label="Guest pays (before the refundable deposit)" amount={naira(example.total)} strong />
            </Box>
          ) : (
            <Text>Enter valid rates to see an example.</Text>
          )
        }
      >
        <FormRow
          label="Service fee"
          labelFor="pricing-serviceFeePercent"
          description="A percentage of the nights, after any discount."
          error={errors.serviceFeePercent}
        >
          <UnitInput
            id="pricing-serviceFeePercent"
            label="Service fee (%)"
            unit="%"
            min={0}
            max={100}
            step="0.01"
            value={values.serviceFeePercent}
            onChange={set('serviceFeePercent')}
            isReadOnly={!canManage}
            isInvalid={Boolean(errors.serviceFeePercent)}
          />
        </FormRow>
        <FormRow
          label="Tax name"
          labelFor="pricing-taxName"
          description="How the tax is labelled on quotes and receipts, e.g. VAT."
          error={errors.taxName}
        >
          <Input
            {...controlProps}
            w={{ base: '100%', md: '168px' }}
            id="pricing-taxName"
            aria-label="Tax name"
            maxLength={40}
            value={values.taxName}
            onChange={set('taxName')}
            isReadOnly={!canManage}
            isInvalid={Boolean(errors.taxName)}
          />
        </FormRow>
        <FormRow
          label="Tax rate"
          labelFor="pricing-taxPercent"
          description="Charged on the nights, cleaning fee and service fee."
          error={errors.taxPercent}
        >
          <UnitInput
            id="pricing-taxPercent"
            label="Tax (%)"
            unit="%"
            min={0}
            max={100}
            step="0.01"
            value={values.taxPercent}
            onChange={set('taxPercent')}
            isReadOnly={!canManage}
            isInvalid={Boolean(errors.taxPercent)}
          />
        </FormRow>
      </FormPanel>

      <SaveBar canManage={canManage} isSaving={update.isPending} isDirty={isDirty} onSave={() => void save()} />
    </Flex>
  );
}

function ExampleLine({ label, amount, strong }: { label: string; amount: string; strong?: boolean }) {
  return (
    <Flex justify="space-between" gap="12px" py="2px" maxW="520px">
      <Text color={strong ? 'ink.500' : 'ink.400'} fontWeight={strong ? 700 : 400}>
        {label}
      </Text>
      <Text color="ink.500" fontWeight={700}>
        {amount}
      </Text>
    </Flex>
  );
}
