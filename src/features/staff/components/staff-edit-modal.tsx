'use client';
import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  Stack,
} from '@chakra-ui/react';
import { AppModal } from '@/shared/components/ui';
import type { StaffMember } from '@/shared/types/hospitable';
import { useRoles } from '../hooks/use-staff';
import { useUpdateMember } from '../hooks/use-staff-mutations';
import type { ApiStaffRole } from '../types';
import { RolePermissionsList } from './role-permissions-list';
export function StaffEditModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}) {
  const roles = useRoles();
  const update = useUpdateMember();
  const [firstName, setFirstName] = useState(member.first_name);
  const [lastName, setLastName] = useState(member.last_name);
  const [roleCode, setRole] = useState<ApiStaffRole>(member.role);
  const [error, setError] = useState('');
  const save = async () => {
    try {
      await update.mutateAsync({
        id: member.id,
        values: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          roleCode,
        },
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save member');
    }
  };
  return (
    <AppModal
      isOpen
      onClose={() => {
        if (!update.isPending) onClose();
      }}
      title="Edit member"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            isDisabled={update.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={() => void save()}
            isLoading={update.isPending}
            isDisabled={
              !firstName.trim() || !lastName.trim() || !roles.data?.length
            }
          >
            Save changes
          </Button>
        </>
      }
    >
      <Stack spacing="14px">
        <FormControl>
          <FormLabel>First name</FormLabel>
          <Input
            value={firstName}
            maxLength={100}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Last name</FormLabel>
          <Input
            value={lastName}
            maxLength={100}
            onChange={(e) => setLastName(e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Role</FormLabel>
          <Select
            value={roleCode}
            onChange={(e) => setRole(e.target.value as ApiStaffRole)}
          >
            {roles.data?.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <RolePermissionsList
          role={roles.data?.find((r) => r.code === roleCode)}
        />
        {error && (
          <Text role="alert" color="red.500">
            {error}
          </Text>
        )}
      </Stack>
    </AppModal>
  );
}
