import { mockReservations } from '@/mocks/data';
import { mockPayments } from '@/mocks/data/payments';
import type { Payment, Refund, Reservation } from '@/shared/types/hospitable';

export type RefundListItem = Refund & {
  payment?: Payment;
  reservation?: Reservation;
};

export const mockRefunds: Refund[] = [
  {
    id: 'ref-001',
    payment_id: 'pay-004',
    reservation_id: 'rsv-004',
    amount: 210000,
    currency: 'NGN',
    status: 'completed',
    reason: 'guest_cancellation',
    notes: 'Full refund per flexible cancellation policy.',
    requested_by: 'Kemi Adebayo',
    processed_at: '2026-09-12T10:20:00Z',
    created_at: '2026-09-12T10:05:00Z',
    updated_at: '2026-09-12T10:20:00Z',
  },
  {
    id: 'ref-002',
    payment_id: 'pay-006',
    reservation_id: 'rsv-006',
    amount: 50000,
    currency: 'NGN',
    status: 'completed',
    reason: 'partial_stay',
    notes: 'Guest checked out one night early; partial refund issued.',
    requested_by: 'Kemi Adebayo',
    processed_at: '2026-09-25T14:00:00Z',
    created_at: '2026-09-25T11:30:00Z',
    updated_at: '2026-09-25T14:00:00Z',
  },
  {
    id: 'ref-003',
    payment_id: 'pay-005',
    reservation_id: 'rsv-005',
    amount: 50000,
    currency: 'NGN',
    status: 'pending_approval',
    reason: 'service_issue',
    notes: 'Guest reported AC fault; requesting caution-deposit portion back.',
    requested_by: 'Tunde Bakare',
    processed_at: null,
    created_at: '2026-09-26T10:00:00Z',
    updated_at: '2026-09-26T10:00:00Z',
  },
  {
    id: 'ref-004',
    payment_id: 'pay-003',
    reservation_id: 'rsv-003',
    amount: 1020000,
    currency: 'NGN',
    status: 'requested',
    reason: 'host_cancellation',
    notes: 'Property unavailable due to emergency maintenance.',
    requested_by: 'System',
    processed_at: null,
    created_at: '2026-09-27T08:15:00Z',
    updated_at: '2026-09-27T08:15:00Z',
  },
  {
    id: 'ref-005',
    payment_id: 'pay-001',
    reservation_id: 'rsv-001',
    amount: 417500,
    currency: 'NGN',
    status: 'processing',
    reason: 'guest_cancellation',
    notes: 'Approved — Flutterwave refund in flight.',
    requested_by: 'Kemi Adebayo',
    processed_at: null,
    created_at: '2026-09-28T09:00:00Z',
    updated_at: '2026-09-28T09:45:00Z',
  },
  {
    id: 'ref-006',
    payment_id: 'pay-007',
    reservation_id: 'rsv-007',
    amount: 25000,
    currency: 'NGN',
    status: 'rejected',
    reason: 'other',
    notes: 'Outside refund window; guest notified.',
    requested_by: 'Ngozi Eze',
    processed_at: '2026-09-22T16:00:00Z',
    created_at: '2026-09-21T12:00:00Z',
    updated_at: '2026-09-22T16:00:00Z',
  },
];

export function buildRefundList(
  refunds: Refund[] = mockRefunds,
  payments: Payment[] = mockPayments,
  reservations: Reservation[] = mockReservations,
): RefundListItem[] {
  const paymentById = new Map(payments.map((item) => [item.id, item]));
  const reservationById = new Map(reservations.map((item) => [item.id, item]));

  return refunds.map((refund) => ({
    ...refund,
    payment: paymentById.get(refund.payment_id),
    reservation: reservationById.get(refund.reservation_id),
  }));
}
