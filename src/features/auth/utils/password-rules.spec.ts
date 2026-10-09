import { meetsPasswordRules, PASSWORD_HINT, validateChangePassword } from './password-rules';

describe('password rules', () => {
  it('needs 8+ characters with an uppercase letter and a special character', () => {
    expect(meetsPasswordRules('Short-1')).toBe(false);
    expect(meetsPasswordRules('lowercase-only-1')).toBe(false);
    expect(meetsPasswordRules('NoSpecial123')).toBe(false);
    expect(meetsPasswordRules('Valid-pass')).toBe(true);
  });

  it('validates the change-password form', () => {
    expect(validateChangePassword({ currentPassword: '', newPassword: 'weak', confirmPassword: 'other' })).toEqual({
      currentPassword: 'Enter your current password.',
      newPassword: PASSWORD_HINT,
      confirmPassword: 'The two passwords do not match.',
    });
    expect(
      validateChangePassword({ currentPassword: 'Same-pass-1!', newPassword: 'Same-pass-1!', confirmPassword: 'Same-pass-1!' }),
    ).toEqual({ newPassword: 'Choose a password different from your current one.' });
    expect(
      validateChangePassword({ currentPassword: 'Old-pass-1!', newPassword: 'New-pass-2!', confirmPassword: 'New-pass-2!' }),
    ).toEqual({});
  });
});
