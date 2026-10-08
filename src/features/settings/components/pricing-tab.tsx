'use client';

import { Box, Flex, Input, SimpleGrid, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ErrorState, PageSkeleton } from '@/shared/components/ui';
import { usePricingSettings, useUpdatePricingSettings } from '../hooks/use-business-settings';
import {
  type FormErrors,
  formToPricingInput,
  type PricingFormValues,
  pricingExample,
  pricingToForm,
  validatePricing,
} from '../utils/settings-forms';
import { apiFieldErrors, Field, inputProps, SaveBar, Section, useSettingsToasts } from './settings-form-parts';

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
  if (isError || !values) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load pricing settings'}
        onRetry={() => void refetch()}
      />
    );
  }

  const set = (field: keyof PricingFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => (current ? { ...current, [field]: event.target.value } : current));
  const fieldProps = (field: keyof PricingFormValues) => ({
    ...inputProps,
    value: values[field],
    onChange: set(field),
    isReadOnly: !canManage,
  });
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
    <Flex direction="column" gap="28px">
      <Section title="Fees and tax" description="Added to every stay. Changes apply to new quotes and bookings only.">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="16px">
          <Field label="Service fee (%)" error={errors.serviceFeePercent} helper="Of the nights, after any discount.">
            <Input
              aria-label="Service fee (%)"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...fieldProps('serviceFeePercent')}
            />
          </Field>
          <Field label="Tax name" error={errors.taxName}>
            <Input aria-label="Tax name" maxLength={40} {...fieldProps('taxName')} />
          </Field>
          <Field label="Tax (%)" error={errors.taxPercent} helper="On the nights, cleaning and service fee.">
            <Input
              aria-label="Tax (%)"
              type="number"
              min={0}
              max={100}
              step="0.01"
              {...fieldProps('taxPercent')}
            />
          </Field>
        </SimpleGrid>
      </Section>

      {example ? (
        <Box borderRadius="14px" bg="bg.400" p="16px" fontSize="14px" data-testid="pricing-example">
          <Text fontWeight={700} mb="6px">
            Example
          </Text>
          <Text color="ink.400">
            A stay with {naira(10_000_000)} of nights and a {naira(1_000_000)} cleaning fee: service
            fee {naira(example.serviceFee)}, {values.taxName || 'tax'} {naira(example.tax)}, guest
            pays <b>{naira(example.total)}</b> (plus the refundable deposit).
          </Text>
        </Box>
      ) : null}

      <SaveBar canManage={canManage} isSaving={update.isPending} onSave={() => void save()} />
    </Flex>
  );
}
