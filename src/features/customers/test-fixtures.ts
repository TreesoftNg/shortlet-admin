import type { Customer } from './types';

export function customer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'cust-1',
    userId: 'user-1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+2348000000000',
    location: 'Lekki',
    locale: 'en-NG',
    pictureUrl: null,
    staysCount: 0,
    totalSpent: 0,
    currency: 'NGN',
    upcomingStays: 0,
    status: 'new',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-04T12:00:00.000Z',
    ...overrides,
  };
}
