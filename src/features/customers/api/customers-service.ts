import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { Customer } from '../types';

async function fetchAllCustomers(): Promise<Customer[]> {
  const limit = 100;
  let page = 1;
  const all: Customer[] = [];

  for (;;) {
    const response = await apiClient<Customer[]>(
      adminPath(`/customers?page=${page}&limit=${limit}`),
    );
    all.push(...response.data);
    const totalPages = response.meta?.totalPages;
    if (!totalPages || page >= totalPages || response.data.length < limit) {
      break;
    }
    page += 1;
  }

  return all;
}

/** GET /cc/customers — all customers for the tenant. */
export async function fetchCustomers(): Promise<Customer[]> {
  return fetchAllCustomers();
}
