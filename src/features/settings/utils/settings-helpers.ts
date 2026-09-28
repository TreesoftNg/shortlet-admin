import type { TenantNotificationSettings } from '@/shared/types/hospitable';

export const NOTIFICATION_OPTIONS: Array<{
  key: keyof TenantNotificationSettings;
  label: string;
}> = [
  { key: 'email_new_booking', label: 'New bookings' },
  { key: 'email_payment_received', label: 'Payments received' },
  { key: 'email_refund_request', label: 'Refund requests' },
  { key: 'email_new_review', label: 'New reviews' },
  { key: 'email_guest_message', label: 'Guest messages' },
  { key: 'digest_daily', label: 'Daily digest' },
];

export function formatSettingsUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function countEnabledNotifications(
  notifications: TenantNotificationSettings,
): number {
  return Object.values(notifications).filter(Boolean).length;
}
