'use client';
import { useState } from 'react';
import {
  Button,
  FormControl,
  FormLabel,
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
/**
 * Changes a member's role. Names belong to the person's own account (shared
 * with other businesses and their guest profile), so they aren't edited here.
 */
export function StaffEditModal({
  member,
  onClose,
}: {
  member: StaffMember;
  onClose: () => void;
}) {
  const roles = useRoles();
  const update = useUpdateMember();
  const [roleCode, setRole] = useState<ApiStaffRole>(member.role);
  const [error, setError] = useState('');
  const save = async () => {
    try {
      await update.mutateAsync({ id: member.id, values: { roleCode } });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change role');
    }
  };
  return (
    <AppModal
      isOpen
      onClose={() => {
        if (!update.isPending) onClose();
      }}
      title="Change role"
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
            isDisabled={!roles.data?.length || roleCode === member.role}
          >
            Save role
          </Button>
        </>
      }
    >
      <Stack spacing="14px">
        <Text fontWeight="700">
          {member.first_name} {member.last_name}
        </Text>
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
