import { Box, Text, List, ListItem } from '@chakra-ui/react';
import type { StaffRoleDefinition } from '../types';
const areas: Record<string, string> = {
  booking: 'Bookings',
  unit: 'Units',
  property: 'Properties',
  payment: 'Payments',
  refund: 'Refunds',
  staff: 'Staff',
  report: 'Reports',
  settings: 'Settings',
};
export function RolePermissionsList({ role }: { role?: StaffRoleDefinition }) {
  const groups = new Map<string, { code: string; name: string }[]>();
  for (const permission of role?.permissions ?? []) {
    const prefix = permission.code.split('.')[0];
    const label =
      areas[prefix] ?? prefix.charAt(0).toUpperCase() + prefix.slice(1);
    groups.set(label, [...(groups.get(label) ?? []), permission]);
  }
  return (
    <Box aria-label="Role permissions">
      {Array.from(groups.entries()).map(([area, permissions]) => (
        <Box key={area} mb="12px">
          <Text fontWeight={700} fontSize="12px" color="ink.300">
            {area}
          </Text>
          <List spacing="4px">
            {permissions.map((p) => (
              <ListItem key={p.code} fontSize="13px">
                {p.name}
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
      {!role && <Text fontSize="13px">Permissions are loading.</Text>}
    </Box>
  );
}
