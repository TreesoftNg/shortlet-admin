import {
  createEmptyStaffInviteForm,
  validateStaffInviteForm,
} from './staff-invite-form';

describe('staff invite form', () => {
  it('requires name and a valid email', () => {
    expect(validateStaffInviteForm(createEmptyStaffInviteForm())).toEqual({
      first_name: 'First name is required',
      last_name: 'Last name is required',
      email: 'Email is required',
    });

    expect(
      validateStaffInviteForm({
        first_name: 'Ada',
        last_name: 'Okafor',
        email: 'not-an-email',
        role: 'staff',
      }).email,
    ).toBe('Enter a valid email');

    expect(
      validateStaffInviteForm({
        first_name: 'Ada',
        last_name: 'Okafor',
        email: 'ada@sunmadeapartments.com',
        role: 'manager',
      }),
    ).toEqual({});
  });
});
