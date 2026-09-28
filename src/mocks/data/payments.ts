import { mockReservations } from '@/mocks/data';
import type { Payment, Reservation } from '@/shared/types/hospitable';

export type PaymentListItem = Payment & {
  reservation?: Reservation;
};

export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    reservation_id: 'rsv-001',
    provider: 'flutterwave',
    reference: 'FLW-HVN7Q4K-001',
    amount: 417500,
    currency: 'NGN',
    status: 'SUCCESS',
    created_at: '2026-09-20T09:15:00Z',
    updated_at: '2026-09-20T09:30:00Z',
  },
  {
    id: 'pay-002a',
    reservation_id: 'rsv-002',
    provider: 'flutterwave',
    reference: 'FLW-HVN3M8P-001',
    amount: 132000,
    currency: 'NGN',
    status: 'FAILED',
    created_at: '2026-09-22T14:06:00Z',
    updated_at: '2026-09-22T14:08:00Z',
  },
  {
    id: 'pay-002b',
    reservation_id: 'rsv-002',
    provider: 'flutterwave',
    reference: 'FLW-HVN3M8P-002',
    amount: 132000,
    currency: 'NGN',
    status: 'PENDING',
    created_at: '2026-09-22T14:10:00Z',
    updated_at: '2026-09-22T14:10:00Z',
  },
  {
    id: 'pay-003',
    reservation_id: 'rsv-003',
    provider: 'flutterwave',
    reference: 'FLW-HVN9X2L-001',
    amount: 1020000,
    currency: 'NGN',
    status: 'SUCCESS',
    created_at: '2026-09-10T11:05:00Z',
    updated_at: '2026-09-10T11:12:00Z',
  },
  {
    id: 'pay-004',
    reservation_id: 'rsv-004',
    provider: 'flutterwave',
    reference: 'FLW-HVN1B7D-001',
    amount: 210000,
    currency: 'NGN',
    status: 'REFUNDED',
    created_at: '2026-09-05T16:45:00Z',
    updated_at: '2026-09-12T10:20:00Z',
  },
  {
    id: 'pay-005',
    reservation_id: 'rsv-005',
    provider: 'flutterwave',
    reference: 'FLW-HVN5T3R-001',
    amount: 680000,
    currency: 'NGN',
    status: 'SUCCESS',
    created_at: '2026-09-18T11:05:00Z',
    updated_at: '2026-09-18T11:18:00Z',
  },
  {
    id: 'pay-006',
    reservation_id: 'rsv-006',
    provider: 'flutterwave',
    reference: 'FLW-HVN8K1W-001',
    amount: 215000,
    currency: 'NGN',
    status: 'PARTIALLY_REFUNDED',
    created_at: '2026-09-16T09:05:00Z',
    updated_at: '2026-09-25T14:00:00Z',
  },
  {
    id: 'pay-007',
    reservation_id: 'rsv-007',
    provider: 'flutterwave',
    reference: 'FLW-HVN2H6Q-001',
    amount: 125000,
    currency: 'NGN',
    status: 'SUCCESS',
    created_at: '2026-09-08T13:05:00Z',
    updated_at: '2026-09-08T13:12:00Z',
  },
  {
    id: 'pay-009',
    reservation_id: 'rsv-005',
    provider: 'flutterwave',
    reference: 'FLW-HVN5T3R-REF',
    amount: 50000,
    currency: 'NGN',
    status: 'REFUND_PENDING',
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-26T10:00:00Z',
  },
  {
    id: 'pay-010',
    reservation_id: 'rsv-001',
    provider: 'flutterwave',
    reference: 'FLW-HVN7Q4K-INIT',
    amount: 417500,
    currency: 'NGN',
    status: 'INITIALIZED',
    created_at: '2026-09-20T09:12:30Z',
    updated_at: '2026-09-20T09:13:00Z',
  },
];

export function buildPaymentList(
  payments: Payment[] = mockPayments,
  reservations: Reservation[] = mockReservations,
): PaymentListItem[] {
  const byId = new Map(reservations.map((item) => [item.id, item]));

  return payments.map((payment) => ({
    ...payment,
    reservation: byId.get(payment.reservation_id),
  }));
}
