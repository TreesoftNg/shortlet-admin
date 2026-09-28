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
} from '@chakra-ui/react';
import type { StaffMember } from '@/shared/types/hospitable';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import {
  formatStaffDate,
  formatStaffDateTime,
  getRolePermissions,
  getStaffRoleLabel,
  getStaffStatusDisplay,
} from '../utils/staff-filters';

type StaffDetailDrawerProps = {
  member: StaffMember | null;
};

export function StaffDetailDrawer({ member }: StaffDetailDrawerProps) {
  if (!member) {
    return (
      <Box
        bg="white"
        border="1px solid"
        borderColor="line.500"
        borderRadius="22px"
        p="24px"
        color="ink.300"
        fontSize="14px"
      >
        Select a team member to view details.
      </Box>
    );
  }

  const status = getStaffStatusDisplay(member.status);
  const permissions = getRolePermissions(member.role);

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="line.500"
      borderRadius="22px"
      overflow="hidden"
      alignSelf="start"
      position={{ xl: 'sticky' }}
      top={{ xl: '28px' }}
    >
      <Box px="22px" py="20px">
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
              label: 'Phone',
              value: <Text as="b">{member.phone ?? '—'}</Text>,
            },
            {
              label: 'Joined',
              value: <Text as="b">{formatStaffDate(member.created_at)}</Text>,
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
          <List spacing="8px">
            {permissions.map((permission) => (
              <ListItem key={permission} fontSize="14px" color="ink.500">
                · {permission}
              </ListItem>
            ))}
          </List>
        </Box>

        <Flex gap="8px" mt="4px" wrap="wrap">
          {member.status === 'invited' ? (
            <Button size="sm" variant="dark" flex="1" minW="110px">
              Resend invite
            </Button>
          ) : null}
          {member.status === 'active' && member.role !== 'owner' ? (
            <Button size="sm" variant="soft">
              Suspend
            </Button>
          ) : null}
          {member.status === 'suspended' ? (
            <Button size="sm" variant="dark" flex="1" minW="110px">
              Reactivate
            </Button>
          ) : null}
          <Button size="sm" variant="soft">
            Edit role
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
