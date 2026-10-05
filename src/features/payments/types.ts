import type {
  PaymentStatus,
  PaymentView,
  RefundView,
  StaffRefundReason,
} from '@/features/bookings/types';

export type { PaymentStatus, PaymentView, RefundView, StaffRefundReason };

export type PaymentDetail = PaymentView & {
  refunds: RefundView[];
};

export type ListPaymentsParams = {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  bookingId?: string;
  search?: string;
};

export type PaginatedPayments = {
  items: PaymentView[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CreateStayRefundInput = {
  amount: number;
  reason: StaffRefundReason;
  note?: string;
};
