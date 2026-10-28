import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createTestQueryClient,
  renderWithProviders,
} from '@/test-utils/render-with-providers';
import { queryKeys } from '@/shared/api/query-keys';
import { mockStaff } from '@/mocks/data/staff';
import { StaffDetailDrawer } from './staff-detail-drawer';
import { RolePermissionsList } from './role-permissions-list';
import { StaffEditModal } from './staff-edit-modal';
import * as api from '../api/staff-service';
jest.mock('../api/staff-service');
const mocked = jest.mocked(api);
const member = {
  ...mockStaff[0],
  is_you: false,
  id: 'm1',
  status: 'active' as const,
};
describe('Staff actions and permission lists', () => {
  it('uses the real permission labels grouped by area', () => {
    renderWithProviders(
      <RolePermissionsList
        role={{
          id: 'r1',
          code: 'staff',
          name: 'Staff',
          permissions: [
            { code: 'booking.read', name: 'View bookings' },
            { code: 'staff.manage', name: 'Manage staff and their roles' },
          ],
        }}
      />,
    );
    expect(screen.getByText('Bookings')).toBeInTheDocument();
    expect(screen.getByText('View bookings')).toBeInTheDocument();
    expect(
      screen.getByText('Manage staff and their roles'),
    ).toBeInTheDocument();
  });
  it('hides member actions on yourself', () => {
    renderWithProviders(
      <StaffDetailDrawer member={{ ...member, is_you: true }} canInvite />,
    );
    expect(
      screen.queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument();
  });
  it('hides member actions without staff.manage', () => {
    renderWithProviders(
      <StaffDetailDrawer member={member} canInvite={false} />,
    );
    expect(
      screen.queryByRole('button', { name: 'Suspend' }),
    ).not.toBeInTheDocument();
  });
  it('offers Reactivate and Remove for suspended members', () => {
    renderWithProviders(
      <StaffDetailDrawer
        member={{ ...member, status: 'suspended' }}
        canInvite
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Reactivate' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Change role' }),
    ).not.toBeInTheDocument();
  });
  it('confirms suspension before sending the mutation', async () => {
    mocked.suspendMember.mockResolvedValue();
    renderWithProviders(<StaffDetailDrawer member={member} canInvite />);
    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }));
    expect(mocked.suspendMember).not.toHaveBeenCalled();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Suspend',
      }),
    );
    expect(mocked.suspendMember).toHaveBeenCalledWith('m1');
  });
  it('offers revoke and resend for pending invites', () => {
    renderWithProviders(
      <StaffDetailDrawer member={{ ...member, status: 'invited' }} canInvite />,
    );
    expect(
      screen.getByRole('button', { name: 'Revoke invite' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Resend invite' }),
    ).toBeInTheDocument();
  });
  it('changes the role only, showing the new role’s permissions', async () => {
    mocked.fetchRoles.mockResolvedValue([
      { id: 'r1', code: 'staff', name: 'Staff', permissions: [] },
      {
        id: 'r2',
        code: 'manager',
        name: 'Manager',
        permissions: [{ code: 'booking.cancel', name: 'Cancel bookings' }],
      },
    ]);
    mocked.updateMember.mockResolvedValue();
    const onClose = jest.fn();
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.auth.me(), {
      success: true,
      data: {
        user: { id: 'u1', email: 'o@example.com', firstName: 'O', lastName: 'W' },
        tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
        role: { code: 'owner', name: 'Owner' },
        permissions: ['staff.read', 'staff.manage'],
      },
    });
    renderWithProviders(
      <StaffEditModal member={{ ...member, role: 'staff' }} onClose={onClose} />,
      queryClient,
    );
    const save = screen.getByRole('button', { name: 'Save role' });
    expect(save).toBeDisabled();
    expect(screen.queryByLabelText('First name')).not.toBeInTheDocument();
    await screen.findByRole('option', { name: 'Manager' });
    await userEvent.selectOptions(screen.getByRole('combobox'), 'manager');
    expect(screen.getByText('Cancel bookings')).toBeInTheDocument();
    await userEvent.click(save);
    expect(mocked.updateMember).toHaveBeenCalledWith('m1', {
      roleCode: 'manager',
    });
    expect(onClose).toHaveBeenCalled();
  });
});
