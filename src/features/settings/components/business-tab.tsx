'use client';

import { Flex, Input, Select, SimpleGrid, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ErrorState, PageSkeleton } from '@/shared/components/ui';
import { useBusinessProfile, useUpdateBusinessProfile } from '../hooks/use-business-settings';
import {
  choicesWith,
  CURRENCY_CHOICES,
  type FormErrors,
  formToProfileInput,
  profileToForm,
  type ProfileFormValues,
  TIMEZONE_CHOICES,
  validateProfile,
} from '../utils/settings-forms';
import { apiFieldErrors, Field, inputProps, SaveBar, Section, useSettingsToasts } from './settings-form-parts';

/** Name, contact details, website, social links and defaults for new properties. */
export function BusinessTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = useBusinessProfile();
  const update = useUpdateBusinessProfile();
  const toasts = useSettingsToasts();
  const [values, setValues] = useState<ProfileFormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors<ProfileFormValues>>({});

  useEffect(() => {
    if (data) setValues(profileToForm(data));
  }, [data]);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !values) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load the business profile'}
        onRetry={() => void refetch()}
      />
    );
  }

  const set = (field: keyof ProfileFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => (current ? { ...current, [field]: event.target.value } : current));
  const fieldProps = (field: keyof ProfileFormValues) => ({
    ...inputProps,
    value: values[field],
    onChange: set(field),
    isReadOnly: !canManage,
  });
  const timezones = choicesWith(TIMEZONE_CHOICES, values.defaultTimezone);
  const currencies = choicesWith(CURRENCY_CHOICES, values.defaultCurrency);

  const save = async () => {
    const found = validateProfile(values);
    setErrors(found);
    if (Object.keys(found).length) {
      toasts.invalid();
      return;
    }
    try {
      const saved = await update.mutateAsync(formToProfileInput(values));
      setValues(profileToForm(saved));
      toasts.saved();
    } catch (err) {
      setErrors(apiFieldErrors(err));
      toasts.failed(err);
    }
  };

  return (
    <Flex direction="column" gap="28px">
      <Section title="Business">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Business name" error={errors.name} isRequired>
            <Input aria-label="Business name" maxLength={150} {...fieldProps('name')} />
          </Field>
          <Field label="Address" error={errors.address}>
            <Input aria-label="Address" maxLength={500} {...fieldProps('address')} />
          </Field>
        </SimpleGrid>
      </Section>

      <Section
        title="Contact"
        description="Guests reply to the support email. The phone is shown on confirmations when a property has no manager contact."
      >
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="16px">
          <Field label="Support email" error={errors.supportEmail}>
            <Input aria-label="Support email" type="email" {...fieldProps('supportEmail')} />
          </Field>
          <Field label="Support phone" error={errors.supportPhone}>
            <Input aria-label="Support phone" {...fieldProps('supportPhone')} />
          </Field>
          <Field label="WhatsApp" error={errors.whatsappPhone}>
            <Input aria-label="WhatsApp" {...fieldProps('whatsappPhone')} />
          </Field>
        </SimpleGrid>
      </Section>

      <Section title="Website and social">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="16px">
          <Field label="Booking website" error={errors.websiteUrl} helper="Links in booking emails open here.">
            <Input aria-label="Booking website" placeholder="https://" {...fieldProps('websiteUrl')} />
          </Field>
          <Field label="Instagram" error={errors.instagramUrl}>
            <Input aria-label="Instagram" placeholder="https://instagram.com/…" {...fieldProps('instagramUrl')} />
          </Field>
          <Field label="Facebook" error={errors.facebookUrl}>
            <Input aria-label="Facebook" placeholder="https://facebook.com/…" {...fieldProps('facebookUrl')} />
          </Field>
          <Field label="TikTok" error={errors.tiktokUrl}>
            <Input aria-label="TikTok" placeholder="https://tiktok.com/@…" {...fieldProps('tiktokUrl')} />
          </Field>
          <Field label="X (Twitter)" error={errors.xUrl}>
            <Input aria-label="X (Twitter)" placeholder="https://x.com/…" {...fieldProps('xUrl')} />
          </Field>
        </SimpleGrid>
      </Section>

      <Section
        title="Defaults for new properties"
        description="New properties start with these; each property can still change them."
      >
        <SimpleGrid columns={{ base: 1, md: 4 }} gap="16px" mb="16px">
          <Field label="Currency" error={errors.defaultCurrency}>
            <Select aria-label="Currency" {...fieldProps('defaultCurrency')} isDisabled={!canManage}>
              {currencies.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Time zone" error={errors.defaultTimezone}>
            <Select aria-label="Time zone" {...fieldProps('defaultTimezone')} isDisabled={!canManage}>
              {timezones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Check-in from" error={errors.defaultCheckInTime}>
            <Input aria-label="Check-in from" type="time" {...fieldProps('defaultCheckInTime')} />
          </Field>
          <Field label="Check-out by" error={errors.defaultCheckOutTime}>
            <Input aria-label="Check-out by" type="time" {...fieldProps('defaultCheckOutTime')} />
          </Field>
        </SimpleGrid>
        <Field label="House rules" error={errors.defaultHouseRules} helper="Guests agree to these before paying.">
          <Textarea
            aria-label="House rules"
            borderColor="line.500"
            borderRadius="12px"
            minH="140px"
            maxLength={5000}
            value={values.defaultHouseRules}
            onChange={set('defaultHouseRules')}
            isReadOnly={!canManage}
          />
        </Field>
      </Section>

      <SaveBar canManage={canManage} isSaving={update.isPending} onSave={() => void save()} />
    </Flex>
  );
}
