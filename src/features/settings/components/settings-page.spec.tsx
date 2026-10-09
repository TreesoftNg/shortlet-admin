import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as businessApi from '../api/business-settings-api';
import * as settingsApi from '../api/settings-service';
import {
  bookingSettings,
  businessProfile,
  paymentSettings,
  pricingSettings,
  settingsResponse,
} from '../test-fixtures';
import { SettingsPage } from './settings-page';

const replace = jest.fn();
let search = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => search,
}));
jest.mock('../api/settings-service');
jest.mock('../api/business-settings-api');

const api = jest.mocked(settingsApi);
const business = jest.mocked(businessApi);

function renderAs(tab: string | null, permissions = ['settings.manage']) {
  search = new URLSearchParams(tab ? { tab } : {});
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<SettingsPage />, queryClient);
}

const saveButton = () => screen.getByRole('button', { name: 'Save changes' });

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchSettings.mockResolvedValue(settingsResponse());
  api.updateSettings.mockResolvedValue(settingsResponse());
  business.fetchBusinessProfile.mockResolvedValue(businessProfile());
  business.updateBusinessProfile.mockImplementation(async (input) => businessProfile({ ...input }));
  business.fetchPricingSettings.mockResolvedValue(pricingSettings());
  business.updatePricingSettings.mockImplementation(async (input) =>
    pricingSettings({
      serviceFeePercent: input.serviceFeePercent.toFixed(2),
      taxName: input.taxName,
      taxPercent: input.taxPercent.toFixed(2),
    }),
  );
  business.fetchBookingSettings.mockResolvedValue(bookingSettings());
  business.updateBookingSettings.mockImplementation(async (input) => bookingSettings(input));
  business.fetchPaymentSettings.mockResolvedValue(paymentSettings());
  business.fetchTenantDomains.mockResolvedValue({
    domains: [{ id: 'd1', domain: 'sunmadeapartments.com', createdAt: '2026-01-01T00:00:00.000Z' }],
  });
  business.updateTenantDomains.mockImplementation(async (input) => ({
    domains: input.domains.map((domain, index) => ({
      id: `d${index + 1}`,
      domain,
      createdAt: '2026-01-01T00:00:00.000Z',
    })),
  }));
});

describe('SettingsPage tabs', () => {
  it('opens Business by default and switches tabs through ?tab=', async () => {
    renderAs(null);
    expect(await screen.findByLabelText('Business name')).toHaveValue('Sunmade');
    await userEvent.click(screen.getByRole('tab', { name: 'Bookings & deposits' }));
    expect(replace).toHaveBeenCalledWith('/settings?tab=bookings', { scroll: false });
  });

  it('falls back to Business for an unknown tab', async () => {
    renderAs('nope');
    expect(await screen.findByLabelText('Business name')).toBeInTheDocument();
  });
});

describe('Business tab', () => {
  it(
    'saves the profile, sending blank fields as null',
    async () => {
      const user = userEvent.setup();
      renderAs('business');
      const email = await screen.findByLabelText('Support email');
      await user.clear(email);
      await user.type(email, 'hello@sunmade.ng');
      const website = screen.getByLabelText('Booking website');
      await user.clear(website);
      await user.type(website, 'https://sunmade.ng');
      await user.selectOptions(screen.getByLabelText('Time zone'), 'Africa/Accra');
      await user.click(saveButton());

      await waitFor(() =>
        expect(business.updateBusinessProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Sunmade',
            supportEmail: 'hello@sunmade.ng',
            supportPhone: null,
            websiteUrl: 'https://sunmade.ng',
            defaultTimezone: 'Africa/Accra',
            defaultHouseRules: 'No parties.',
          }),
        ),
      );
      expect(await screen.findByText('Settings saved')).toBeInTheDocument();
    },
    15_000,
  );

  it('shows when there are unsaved changes', async () => {
    renderAs('business');
    expect(await screen.findAllByText('All changes saved.')).not.toHaveLength(0);
    await userEvent.type(screen.getByLabelText('Address'), '1 Test Close');
    expect(screen.getByText('You have unsaved changes.')).toBeInTheDocument();
  });

  it('shows validation errors and does not save', async () => {
    renderAs('business');
    await userEvent.type(await screen.findByLabelText('Support email'), 'nope');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(business.updateBusinessProfile).not.toHaveBeenCalled();
  });

  it('shows field errors from the API under the input', async () => {
    business.updateBusinessProfile.mockRejectedValue(
      new ApiClientError('Validation failed', {
        code: 'VALIDATION_ERROR',
        status: 400,
        details: { fields: { defaultTimezone: ['Use a valid IANA time zone'] } },
      }),
    );
    renderAs('business');
    await screen.findByLabelText('Business name');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Use a valid IANA time zone')).toBeInTheDocument();
    expect(screen.getByText('Could not save')).toBeInTheDocument();
  });

  it('is read-only without settings.manage', async () => {
    renderAs('business', []);
    expect(await screen.findByLabelText('Business name')).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
    expect(screen.getByText('Only owners and admins can change these settings.')).toBeInTheDocument();
  });
});

describe('Pricing tab', () => {
  it('shows a live example and saves numbers', async () => {
    renderAs('pricing');
    const fee = await screen.findByLabelText('Service fee (%)');
    expect(screen.getByTestId('pricing-example')).toHaveTextContent('₦129,000.00');
    await userEvent.clear(fee);
    await userEvent.type(fee, '5');
    expect(screen.getByTestId('pricing-example')).toHaveTextContent('₦123,625.00');
    await userEvent.click(saveButton());
    await waitFor(() =>
      expect(business.updatePricingSettings).toHaveBeenCalledWith({
        serviceFeePercent: 5,
        taxName: 'VAT',
        taxPercent: 7.5,
      }),
    );
  });

  it('rejects an invalid percentage', async () => {
    renderAs('pricing');
    const tax = await screen.findByLabelText('Tax (%)');
    await userEvent.clear(tax);
    await userEvent.type(tax, '150');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Enter 0–100, up to 2 decimals.')).toBeInTheDocument();
    expect(screen.queryByTestId('pricing-example')).not.toBeInTheDocument();
    expect(business.updatePricingSettings).not.toHaveBeenCalled();
  });
});

describe('Bookings & deposits tab', () => {
  it('shows the rules as sentences with a worked deposit example', async () => {
    renderAs('bookings');
    expect(await screen.findByLabelText('Website payment hold (minutes)')).toHaveValue(15);
    expect(screen.getByText(/Changes apply to new bookings only/)).toBeInTheDocument();
    expect(screen.getByLabelText('Charge a security deposit')).toBeChecked();
    expect(screen.getByLabelText('Different deposit for long stays')).toBeChecked();
    const example = screen.getByTestId('deposit-example');
    expect(example).toHaveTextContent('3-night stay ₦50,000 deposit');
    expect(example).toHaveTextContent('15-night stay ₦100,000 deposit');
  });

  it('saves new rules and updates the example as you type', async () => {
    renderAs('bookings');
    const deposit = await screen.findByLabelText('Deposit (nights)');
    await userEvent.clear(deposit);
    await userEvent.type(deposit, '2');
    const hold = screen.getByLabelText('Website payment hold (minutes)');
    await userEvent.clear(hold);
    await userEvent.type(hold, '30');
    expect(screen.getByTestId('deposit-example')).toHaveTextContent('3-night stay ₦100,000 deposit');
    await userEvent.click(saveButton());

    await waitFor(() =>
      expect(business.updateBookingSettings).toHaveBeenCalledWith({
        paymentHoldMinutes: 30,
        staffLinkHoldHours: 24,
        depositNights: 2,
        longStayDepositNights: 2,
        longStayMinNights: 15,
        depositReleaseHours: 24,
      }),
    );
  });

  it('turning off the long-stay deposit makes long stays pay the usual deposit', async () => {
    renderAs('bookings');
    await userEvent.click(await screen.findByLabelText('Different deposit for long stays'));
    expect(screen.queryByLabelText('Long stays from (nights)')).not.toBeInTheDocument();
    expect(screen.getByTestId('deposit-example')).not.toHaveTextContent('15-night');
    await userEvent.click(saveButton());
    await waitFor(() =>
      expect(business.updateBookingSettings).toHaveBeenCalledWith(
        expect.objectContaining({ depositNights: 1, longStayDepositNights: 1, longStayMinNights: 15 }),
      ),
    );
  });

  it('turning off the deposit saves no deposit and hides the deposit rules', async () => {
    renderAs('bookings');
    await userEvent.click(await screen.findByLabelText('Charge a security deposit'));
    expect(screen.queryByLabelText('Deposit (nights)')).not.toBeInTheDocument();
    expect(screen.queryByTestId('deposit-example')).not.toBeInTheDocument();
    await userEvent.click(saveButton());
    await waitFor(() =>
      expect(business.updateBookingSettings).toHaveBeenCalledWith(
        expect.objectContaining({ depositNights: 0, longStayDepositNights: 0 }),
      ),
    );
  });

  it('opens with the deposit off when none is charged', async () => {
    business.fetchBookingSettings.mockResolvedValue(bookingSettings({ depositNights: 0, longStayDepositNights: 0 }));
    renderAs('bookings');
    expect(await screen.findByLabelText('Charge a security deposit')).not.toBeChecked();
    expect(screen.queryByLabelText('Deposit (nights)')).not.toBeInTheDocument();
  });

  it('rejects values outside the limits', async () => {
    renderAs('bookings');
    const linkHold = await screen.findByLabelText('Payment link hold (hours)');
    await userEvent.clear(linkHold);
    await userEvent.type(linkHold, '48');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Enter a whole number from 1 to 24.')).toBeInTheDocument();
    expect(business.updateBookingSettings).not.toHaveBeenCalled();
  });

  it('is read-only without settings.manage', async () => {
    renderAs('bookings', []);
    expect(await screen.findByLabelText('Deposit (nights)')).toHaveAttribute('readonly');
    expect(screen.getByLabelText('Charge a security deposit')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });
});

describe('Payments tab', () => {
  it('shows status and the webhook URL, copies it, and never shows a key', async () => {
    const user = userEvent.setup();
    const { container } = renderAs('payments');
    expect(await screen.findByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Test mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Webhook URL')).toHaveValue(paymentSettings().webhookUrl);
    expect(container).not.toHaveTextContent(/FLWSECK|FLWPUBK/);

    await user.click(screen.getByRole('button', { name: 'Copy' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
    await expect(navigator.clipboard.readText()).resolves.toBe(paymentSettings().webhookUrl);
  });

  it('shows when Flutterwave is not set up', async () => {
    business.fetchPaymentSettings.mockResolvedValue(
      paymentSettings({ configured: false, mode: null, webhookSecretSet: false }),
    );
    renderAs('payments');
    expect(await screen.findByText('Not set up')).toBeInTheDocument();
    expect(screen.queryByText('Test mode')).not.toBeInTheDocument();
  });

  it('does not load payment status without settings.manage', async () => {
    renderAs('payments', []);
    expect(await screen.findByText('Only owners and admins can see payment settings.')).toBeInTheDocument();
    expect(business.fetchPaymentSettings).not.toHaveBeenCalled();
  });
});

describe('Notifications tab', () => {
  it('lists email alert toggles and saves them', async () => {
    renderAs('notifications');
    expect(await screen.findByText('New bookings')).toBeInTheDocument();
    const switches = screen.getAllByRole('checkbox');
    await userEvent.click(switches[2]);
    await userEvent.click(saveButton());
    await waitFor(() =>
      expect(api.updateSettings).toHaveBeenCalledWith({
        'email.booking_created': true,
        'email.payment_failed': true,
        'email.review_submitted': true,
      }),
    );
    expect(await screen.findByText('Settings saved')).toBeInTheDocument();
  });

  it('hides save without settings.manage', async () => {
    renderAs('notifications', []);
    expect(await screen.findByText('New bookings')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
  });

  it('toasts API errors from save', async () => {
    api.updateSettings.mockRejectedValue(
      new ApiClientError('Could not save settings', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderAs('notifications');
    await screen.findByText('New bookings');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Could not save')).toBeInTheDocument();
    expect(screen.getByText('Could not save settings')).toBeInTheDocument();
  });
});
