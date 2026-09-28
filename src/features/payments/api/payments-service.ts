import { isMockMode, mockApi } from '@/mocks/api';
import type { PaymentListItem } from '@/mocks/data/payments';
import { apiClient } from '@/shared/api/client';

export async function fetchPayments() {
  if (isMockMode()) {
    return mockApi.getPayments();
  }

  return apiClient<PaymentListItem[]>('/payments');
}
