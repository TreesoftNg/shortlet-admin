'use client';

import { Flex, Input, Select, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { apiFieldErrors } from '@/shared/api/field-errors';
import { ErrorState, FormPanel, FormRow, PageSkeleton } from '@/shared/components/ui';
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
import { controlProps, SaveBar, useSettingsToasts } from './settings-form-parts';

const fieldId = (field: keyof ProfileFormValues) => `business-${field}`;

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
  if (isError || !values || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load the business profile'}
        onRetry={() => void refetch()}
      />
    );
  }

  const isDirty = JSON.stringify(values) !== JSON.stringify(profileToForm(data));
  const set = (field: keyof ProfileFormValues) => (event: { target: { value: string } }) =>
    setValues((current) => (current ? { ...current, [field]: event.target.value } : current));
  const fieldProps = (field: keyof ProfileFormValues, label: string) => ({
    ...controlProps,
    id: fieldId(field),
    'aria-label': label,
    value: values[field],
    onChange: set(field),
    isReadOnly: !canManage,
    isInvalid: Boolean(errors[field]),
  });
  const timezones = choicesWith(TIMEZONE_CHOICES, values.defaultTimezone);
  const currencies = choicesWith(CURRENCY_CHOICES, values.defaultCurrency);

  /** A row whose control is a text input. */
  const textRow = (
    field: keyof ProfileFormValues,
    label: string,
    description: string,
    input: { type?: string; placeholder?: string; maxLength?: number } = {},
  ) => (
    <FormRow label={label} labelFor={fieldId(field)} description={description} error={errors[field]}>
      <Input {...fieldProps(field, label)} {...input} />
    </FormRow>
  );

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
    <Flex direction="column" gap="20px">
      <FormPanel title="Business details" description="How guests see your business in emails and on the booking site.">
        {textRow('name', 'Business name', 'Shown on booking emails and receipts.', { maxLength: 150 })}
        {textRow('address', 'Address', 'Printed at the bottom of guest emails.', { maxLength: 500 })}
      </FormPanel>

      <FormPanel title="Contact" description="How guests reach you about a booking.">
        {textRow('supportEmail', 'Support email', 'Guests who reply to a booking email write to this address.', {
          type: 'email',
          placeholder: 'hello@yourbusiness.com',
        })}
        {textRow('supportPhone', 'Support phone', "Shown on confirmations when a property has no manager's number.", {
          placeholder: '+234 …',
        })}
        {textRow('whatsappPhone', 'WhatsApp', 'Used when there is no support phone.', { placeholder: '+234 …' })}
      </FormPanel>

      <FormPanel title="Website and social">
        {textRow('websiteUrl', 'Booking website', 'Links in booking emails open here.', { placeholder: 'https://' })}
        {textRow('instagramUrl', 'Instagram', 'Full link to your profile.', { placeholder: 'https://instagram.com/…' })}
        {textRow('facebookUrl', 'Facebook', 'Full link to your page.', { placeholder: 'https://facebook.com/…' })}
        {textRow('tiktokUrl', 'TikTok', 'Full link to your profile.', { placeholder: 'https://tiktok.com/@…' })}
        {textRow('xUrl', 'X (Twitter)', 'Full link to your profile.', { placeholder: 'https://x.com/…' })}
      </FormPanel>

      <FormPanel
        title="Defaults for new properties"
        description="New properties start with these. Each property can still change them."
      >
        <FormRow
          label="Currency"
          labelFor={fieldId('defaultCurrency')}
          description="Prices and payments use this currency."
          error={errors.defaultCurrency}
        >
          <Select {...fieldProps('defaultCurrency', 'Currency')} isDisabled={!canManage}>
            {currencies.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </Select>
        </FormRow>
        <FormRow
          label="Time zone"
          labelFor={fieldId('defaultTimezone')}
          description="Check-in and check-out times are in this time zone."
          error={errors.defaultTimezone}
        >
          <Select {...fieldProps('defaultTimezone', 'Time zone')} isDisabled={!canManage}>
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </Select>
        </FormRow>
        {textRow('defaultCheckInTime', 'Check-in from', 'Earliest time guests can arrive.', { type: 'time' })}
        {textRow('defaultCheckOutTime', 'Check-out by', 'Latest time guests must leave.', { type: 'time' })}
        <FormRow
          label="House rules"
          labelFor={fieldId('defaultHouseRules')}
          description="Guests agree to these before paying. One rule per line."
          error={errors.defaultHouseRules}
          isStacked
        >
          <Textarea
            id={fieldId('defaultHouseRules')}
            aria-label="House rules"
            borderColor="line.500"
            borderRadius="10px"
            fontSize="14px"
            minH="150px"
            maxLength={5000}
            value={values.defaultHouseRules}
            onChange={set('defaultHouseRules')}
            isReadOnly={!canManage}
            isInvalid={Boolean(errors.defaultHouseRules)}
          />
        </FormRow>
      </FormPanel>

      <SaveBar canManage={canManage} isSaving={update.isPending} isDirty={isDirty} onSave={() => void save()} />
    </Flex>
  );
}
