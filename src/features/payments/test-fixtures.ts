import { paymentView, refundView } from '@/features/bookings/test-fixtures';
import type { PaymentDetail, PaymentView } from './types';

export function paymentListItem(
  overrides: Partial<PaymentView> = {},
): PaymentView {
  return paymentView(overrides);
}

export function paymentDetail(
  overrides: Partial<PaymentDetail> = {},
): PaymentDetail {
  return {
    ...paymentView(),
    refunds: [],
    ...overrides,
  };
}

export { refundView };
