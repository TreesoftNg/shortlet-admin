import { isMockMode, mockApi } from '@/mocks/api';
import { apiClient } from '@/shared/api/client';
import type { CustomerListItem } from '../utils/customer-filters';

export async function fetchCustomers() {
  if (isMockMode()) {
    return mockApi.getCustomers();
  }

  return apiClient<CustomerListItem[]>('/customers');
}
