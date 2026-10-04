import type { Review } from './types';

export function review(overrides: Partial<Review> = {}): Review {
  return {
    id: 'rev-1',
    unitId: 'unit-1',
    unitName: 'Lagoon View Penthouse',
    customerId: 'cust-1',
    guestFirstName: 'Sarah',
    guestLastName: 'Johnson',
    guestFullName: 'Sarah Johnson',
    guestEmail: 'sarah@example.com',
    rating: 5,
    comment: 'Wonderful penthouse stay.',
    status: 'published',
    adminResponse: null,
    respondedAt: null,
    canRespond: true,
    createdAt: '2026-10-02T10:00:00.000Z',
    ...overrides,
  };
}
