'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/query-keys';
import { fetchCustomers } from '../api/customers-service';

export function useCustomers({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.customers.list(),
    queryFn: fetchCustomers,
    enabled,
  });
}
