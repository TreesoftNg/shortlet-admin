import type { StaffRole } from '@/shared/types/hospitable';

export type StaffInviteFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  role: StaffRole;
};

export type StaffInviteFormErrors = Partial<
  Record<keyof StaffInviteFormValues, string>
>;

export function createEmptyStaffInviteForm(): StaffInviteFormValues {
  return {
    first_name: '',
    last_name: '',
    email: '',
    role: 'staff',
  };
}

export function validateStaffInviteForm(
  values: StaffInviteFormValues,
): StaffInviteFormErrors {
  const errors: StaffInviteFormErrors = {};
  if (!values.first_name.trim()) errors.first_name = 'First name is required';
  if (!values.last_name.trim()) errors.last_name = 'Last name is required';
  const email = values.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email';
  }
  return errors;
}
