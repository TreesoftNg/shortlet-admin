'use client';

import { useState } from 'react';
import { useRoles } from '../hooks/use-staff';
import { RolePermissionsList } from './role-permissions-list';
import { StaffEditModal } from './staff-edit-modal';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import type { StaffMember } from '@/shared/types/hospitable';
import {
  ConfirmModal,
  KeyValueList,
  StatusBadge,
} from '@/shared/components/ui';
import {
  useInviteStaff,
  useSuspendMember,
  useReactivateMember,
  useRemoveMember,
  useRevokeInvite,
} from '../hooks/use-staff-mutations';
import {
  formatStaffDate,
  formatStaffDateTime,
  getStaffRoleLabel,
  getStaffStatusDisplay,
} from '../utils/staff-filters';

type StaffDetailDrawerProps = {
  member: StaffMember | null;
  canInvite: boolean;
};

export function StaffDetailDrawer({
  member,
  canInvite,
}: StaffDetailDrawerProps) {
  const toast = useToast();
  const invite = useInviteStaff();
  const roles = useRoles();
  const suspend = useSuspendMember();
  const reactivate = useReactivateMember();
  const remove = useRemoveMember();
  const revoke = useRevokeInvite();
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState<
    'Suspend' | 'Remove' | 'Revoke invite' | null
  >(null);
  const busy =
    suspend.isPending ||
    reactivate.isPending ||
    remove.isPending ||
    revoke.isPending;
  const run = async (operation: () => Promise<void>) => {
    try {
      await operation();
      setAction(null);
      toast({ title: 'Team updated', status: 'success' });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : 'Could not update team',
        status: 'error',
      });
    }
  };

  if (!member) {
    return null;
  }

  const status = getStaffStatusDisplay(member.status);
  const handleResend = async () => {
    try {
      const sent = await invite.mutateAsync({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        role: member.role,
      });
      toast({
        title: 'Invite resent',
        description: `A new password link was emailed to ${sent.email}.`,
        status: 'success',
        duration: 3500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Could not resend invite',
        description: error instanceof Error ? error.message : undefined,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Flex gap="12px" align="center" mb="16px">
        <Avatar
          size="lg"
          name={member.full_name}
          src={member.avatar_url ?? undefined}
        />
        <Box minW={0} flex="1">
          <Heading as="h3" fontSize="18px" fontWeight={700} noOfLines={1}>
            {member.full_name}
          </Heading>
          <Text color="ink.400" fontSize="13px" noOfLines={1}>
            {getStaffRoleLabel(member.role)}
            {member.is_you ? ' · You' : ''}
          </Text>
        </Box>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </Flex>

      <KeyValueList
        title="Contact"
        items={[
          {
            label: 'Email',
            value: <Text as="b">{member.email}</Text>,
          },
          {
            label: 'Role',
            value: <Text as="b">{getStaffRoleLabel(member.role)}</Text>,
          },
          {
            label: 'Last active',
            value: (
              <Text as="b">{formatStaffDateTime(member.last_active_at)}</Text>
            ),
          },
          {
            label: 'Invited',
            value: <Text as="b">{formatStaffDate(member.invited_at)}</Text>,
          },
          {
            label: 'Invite expires',
            value: (
              <Text as="b">
                {member.invite_expires_at
                  ? formatStaffDateTime(member.invite_expires_at)
                  : '—'}
              </Text>
            ),
          },
        ]}
      />

      <Box py="16px" borderTop="1px solid" borderColor="line.500">
        <Text
          fontSize="12px"
          textTransform="uppercase"
          letterSpacing="0.05em"
          color="ink.300"
          fontWeight={700}
          mb="10px"
        >
          Permissions
        </Text>
        <RolePermissionsList
          role={roles.data?.find((role) => role.code === member.role)}
        />
      </Box>

      {member.status === 'invited' && canInvite && !member.is_you ? (
        <Flex gap="8px" mt="4px" wrap="wrap">
          <Button
            size="sm"
            variant="dark"
            flex="1"
            minW="110px"
            onClick={() => void handleResend()}
            isLoading={invite.isPending}
          >
            Resend invite
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAction('Revoke invite')}
          >
            Revoke invite
          </Button>
        </Flex>
      ) : null}

      {canInvite && !member.is_you && member.status !== 'invited' && (
        <Flex gap="8px" wrap="wrap">
          {member.status === 'active' && (
            <>
              <Button size="sm" onClick={() => setEditing(true)}>
                Change role
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setAction('Suspend')}
              >
                Suspend
              </Button>
            </>
          )}
          {member.status === 'suspended' && (
            <Button
              size="sm"
              isLoading={reactivate.isPending}
              onClick={() => void run(() => reactivate.mutateAsync(member.id))}
            >
              Reactivate
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setAction('Remove')}
          >
            Remove
          </Button>
        </Flex>
      )}
      {editing && (
        <StaffEditModal
          key={member.id}
          member={member}
          onClose={() => setEditing(false)}
        />
      )}
      <ConfirmModal
        isOpen={Boolean(action)}
        title={`${action ?? ''} ${member.full_name}?`}
        description={
          action === 'Revoke invite'
            ? 'Their invitation link will stop working.'
            : 'Their current sessions for this business will be signed out.'
        }
        confirmLabel={action ?? 'Confirm'}
        isLoading={busy}
        onClose={() => setAction(null)}
        onConfirm={() =>
          run(() =>
            action === 'Suspend'
              ? suspend.mutateAsync(member.id)
              : action === 'Remove'
                ? remove.mutateAsync(member.id)
                : revoke.mutateAsync(member.id),
          )
        }
      />
      {member.status === 'invited' && !canInvite ? (
        <Text fontSize="13px" color="ink.300" mt="8px">
          You need permission to manage staff to resend a password link.
        </Text>
      ) : null}
    </Box>
  );
}
