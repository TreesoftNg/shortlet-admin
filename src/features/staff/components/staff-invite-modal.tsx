'use client';

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Input,
  Select,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import type { StaffMember } from '@/shared/types/hospitable';
import { AppModal } from '@/shared/components/ui';
import {
  createEmptyStaffInviteForm,
  validateStaffInviteForm,
  type StaffInviteFormErrors,
  type StaffInviteFormValues,
} from '../utils/staff-invite-form';
import { INVITE_ROLE_OPTIONS } from '../utils/staff-filters';
import { useInviteStaff } from '../hooks/use-staff-mutations';

const inputProps = {
  borderColor: 'line.500',
  borderRadius: '12px',
  h: '44px',
  bg: 'white',
} as const;

type StaffInviteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onInvited: (member: StaffMember) => void;
};

export function StaffInviteModal({
  isOpen,
  onClose,
  onInvited,
}: StaffInviteModalProps) {
  const invite = useInviteStaff();
  const [values, setValues] = useState<StaffInviteFormValues>(
    createEmptyStaffInviteForm,
  );
  const [errors, setErrors] = useState<StaffInviteFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = <K extends keyof StaffInviteFormValues>(
    key: K,
    value: StaffInviteFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleClose = () => {
    if (invite.isPending) return;
    setValues(createEmptyStaffInviteForm());
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  const handleSubmit = async () => {
    const nextErrors = validateStaffInviteForm(values);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const member = await invite.mutateAsync(values);
      onInvited(member);
      setValues(createEmptyStaffInviteForm());
      setErrors({});
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Could not send invite',
      );
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite staff"
      size="lg"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            isDisabled={invite.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            isLoading={invite.isPending}
            loadingText="Sending"
          >
            Send invite
          </Button>
        </>
      }
    >
      <Text fontSize="14px" color="ink.400" mb="16px">
        The API emails a password link. Only an owner can invite. Sending again
        to the same email replaces the previous link.
      </Text>

      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
        <FormControl isInvalid={Boolean(errors.first_name)} isRequired>
          <FormLabel fontSize="13px">First name</FormLabel>
          <Input
            value={values.first_name}
            onChange={(event) => updateField('first_name', event.target.value)}
            {...inputProps}
          />
          <FormErrorMessage>{errors.first_name}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.last_name)} isRequired>
          <FormLabel fontSize="13px">Last name</FormLabel>
          <Input
            value={values.last_name}
            onChange={(event) => updateField('last_name', event.target.value)}
            {...inputProps}
          />
          <FormErrorMessage>{errors.last_name}</FormErrorMessage>
        </FormControl>
        <FormControl
          isInvalid={Boolean(errors.email)}
          isRequired
          gridColumn={{ md: '1 / -1' }}
        >
          <FormLabel fontSize="13px">Email</FormLabel>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="ada@sunmadeapartments.com"
            {...inputProps}
          />
          <FormErrorMessage>{errors.email}</FormErrorMessage>
        </FormControl>
        <FormControl gridColumn={{ md: '1 / -1' }}>
          <FormLabel fontSize="13px">Role</FormLabel>
          <Select
            value={values.role}
            onChange={(event) =>
              updateField('role', event.target.value as StaffInviteFormValues['role'])
            }
            {...inputProps}
          >
            {INVITE_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {submitError ? (
        <Text color="red.500" fontSize="13px" mt="12px">
          {submitError}
        </Text>
      ) : null}
    </AppModal>
  );
}
