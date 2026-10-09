/** Must match the API's PASSWORD_PATTERN (auth.constants.ts). */
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,128}$/;

export const PASSWORD_HINT = 'At least 8 characters, with an uppercase letter and a special character.';

export function meetsPasswordRules(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}

export type ChangePasswordValues = { currentPassword: string; newPassword: string; confirmPassword: string };
export type ChangePasswordErrors = Partial<Record<keyof ChangePasswordValues, string>>;

/** Checks the change-password form before it is sent. */
export function validateChangePassword(values: ChangePasswordValues): ChangePasswordErrors {
  const errors: ChangePasswordErrors = {};
  if (!values.currentPassword) errors.currentPassword = 'Enter your current password.';
  if (!meetsPasswordRules(values.newPassword)) errors.newPassword = PASSWORD_HINT;
  else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'Choose a password different from your current one.';
  }
  if (values.confirmPassword !== values.newPassword) errors.confirmPassword = 'The two passwords do not match.';
  return errors;
}
