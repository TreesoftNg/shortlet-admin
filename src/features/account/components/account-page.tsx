'use client';

import { Box, Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, IconButton, Text, useToast } from '@chakra-ui/react';
import { type FormEvent, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useChangePassword, useMe } from '@/features/auth/hooks/use-auth';
import { displayName } from '@/features/auth/utils/auth-helpers';
import {
  type ChangePasswordErrors,
  type ChangePasswordValues,
  PASSWORD_HINT,
  validateChangePassword,
} from '@/features/auth/utils/password-rules';
import { apiFieldErrors } from '@/shared/api/field-errors';
import { ApiClientError } from '@/shared/api/types';
import { FormPanel, FormPanelBody, FormRow, PageHeader, PasswordInput } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';

const EMPTY: ChangePasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** The signed-in staff member's own details and password. */
export function AccountPage() {
  const { data: profile } = useMe();
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  return (
    <Box maxW="760px">
      <PageHeader
        title="Your account"
        description="Your sign-in details"
        actions={
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
        }
      />
      <Flex direction="column" gap="20px">
        <FormPanel title="Profile" description="Ask an owner if any of these need to change.">
          <FormRow label="Name" isInline>
            <Text fontSize="14px" fontWeight={600}>
              {profile ? displayName(profile) : '—'}
            </Text>
          </FormRow>
          <FormRow label="Email" isInline>
            <Text fontSize="14px" fontWeight={600} noOfLines={1}>
              {profile?.user.email ?? '—'}
            </Text>
          </FormRow>
          <FormRow label="Role" isInline>
            <Text fontSize="14px" fontWeight={600}>
              {profile?.role.name ?? '—'}
            </Text>
          </FormRow>
          <FormRow label="Business" isInline>
            <Text fontSize="14px" fontWeight={600}>
              {profile?.tenant.name ?? '—'}
            </Text>
          </FormRow>
        </FormPanel>

        <ChangePasswordForm />
      </Flex>
    </Box>
  );
}

function ChangePasswordForm() {
  const toast = useToast();
  const change = useChangePassword();
  const [values, setValues] = useState<ChangePasswordValues>(EMPTY);
  const [errors, setErrors] = useState<ChangePasswordErrors>({});

  const set = (field: keyof ChangePasswordValues) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateChangePassword(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      const result = await change.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setValues(EMPTY);
      const others = result.otherSessionsSignedOut;
      toast({
        status: 'success',
        title: 'Password changed',
        description:
          others > 0
            ? `You're still signed in here. ${others} other device${others === 1 ? ' was' : 's were'} signed out.`
            : "You're still signed in here.",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      const fields = apiFieldErrors(error);
      setErrors(fields);
      if (!Object.keys(fields).length) {
        toast({
          status: 'error',
          title: 'Could not change your password',
          description: error instanceof ApiClientError ? error.message : 'Something went wrong',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const field = (name: keyof ChangePasswordValues, label: string, helper?: string, autoComplete = 'new-password') => (
    <FormControl isInvalid={Boolean(errors[name])}>
      <FormLabel>{label}</FormLabel>
      <PasswordInput
        aria-label={label}
        value={values[name]}
        onChange={set(name)}
        autoComplete={autoComplete}
      />
      {errors[name] ? (
        <FormErrorMessage>{errors[name]}</FormErrorMessage>
      ) : helper ? (
        <FormHelperText fontSize="12px" color="ink.300">
          {helper}
        </FormHelperText>
      ) : null}
    </FormControl>
  );

  return (
    <Box as="form" onSubmit={submit} noValidate>
      <FormPanel
        title="Change password"
        description="You'll need your current password."
        footer={
          <>
            <Text>Other devices you&apos;re signed in on will be signed out.</Text>
            <Button type="submit" h="40px" px="18px" borderRadius="10px" isLoading={change.isPending} w={{ base: '100%', md: 'auto' }}>
              Change password
            </Button>
          </>
        }
      >
        <FormPanelBody>
          {field('currentPassword', 'Current password', undefined, 'current-password')}
          {field('newPassword', 'New password', PASSWORD_HINT)}
          {field('confirmPassword', 'Confirm new password')}
        </FormPanelBody>
      </FormPanel>
    </Box>
  );
}
