import type { TenantSettings } from '@/shared/types/hospitable';

export const mockTenantSettings: TenantSettings = {
  organization: {
    name: 'Haven Shortlets',
    legal_name: 'Haven Hospitality Ltd',
    support_email: 'hello@haven.ng',
    support_phone: '+2348010000099',
    timezone: 'Africa/Lagos',
    currency: 'NGN',
    default_check_in: '14:00',
    default_check_out: '11:00',
  },
  notifications: {
    email_new_booking: true,
    email_payment_received: true,
    email_refund_request: true,
    email_new_review: true,
    email_guest_message: false,
    digest_daily: true,
  },
  payments: {
    provider: 'flutterwave',
    public_key_hint: 'FLWPUBK_TEST-••••••a91f',
    webhook_url: 'https://api.haven.ng/webhooks/flutterwave',
    connected: true,
    settlement_currency: 'NGN',
  },
  integrations: [
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'Card and transfer payments for direct bookings.',
      connected: true,
      status_label: 'Connected',
    },
    {
      id: 'hospitable',
      name: 'Hospitable',
      description: 'Sync calendars, reservations, and messaging.',
      connected: false,
      status_label: 'Not connected',
    },
    {
      id: 'airbnb',
      name: 'Airbnb',
      description: 'Import channel listings and availability.',
      connected: true,
      status_label: 'Synced',
    },
  ],
  updated_at: '2026-09-26T16:00:00Z',
};
