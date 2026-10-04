'use client';

import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  useToast,
} from '@chakra-ui/react';
import type { StaffMember } from '@/shared/types/hospitable';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import { useInviteStaff } from '../hooks/use-staff-mutations';
import {
  formatPermissionCode,
  formatStaffDate,
  formatStaffDateTime,
  getRolePermissions,
  getStaffRoleLabel,
  getStaffStatusDisplay,
} from '../utils/staff-filters';

type StaffDetailDrawerProps = {
  member: StaffMember | null;
  canInvite: boolean;
  onInviteRecorded?: (member: StaffMember) => void;
};

export function StaffDetailDrawer({
  member,
  canInvite,
  onInviteRecorded,
}: StaffDetailDrawerProps) {
  const toast = useToast();
  const invite = useInviteStaff();

  if (!member) {
    return null;
  }

  const status = getStaffStatusDisplay(member.status);
  const permissionLabels =
    member.permissions.length > 0
      ? member.permissions.map(formatPermissionCode)
      : getRolePermissions(member.role);

  const handleResend = async () => {
    try {
      const sent = await invite.mutateAsync({
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        role: member.role,
      });
      onInviteRecorded?.(sent);
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
        {permissionLabels.length > 0 ? (
          <List spacing="8px">
            {permissionLabels.map((permission) => (
              <ListItem key={permission} fontSize="14px" color="ink.500">
                · {permission}
              </ListItem>
            ))}
          </List>
        ) : (
          <Text fontSize="14px" color="ink.300">
            No permissions listed
          </Text>
        )}
      </Box>

      {member.status === 'invited' && canInvite ? (
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
        </Flex>
      ) : null}

      {member.status === 'invited' && !canInvite ? (
        <Text fontSize="13px" color="ink.300" mt="8px">
          Only an owner can resend a password link.
        </Text>
      ) : null}
    </Box>
  );
}
