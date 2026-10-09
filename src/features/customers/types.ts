export type CustomerStatus = 'guest' | 'new';

/** One row from GET /cc/customers. */
export type Customer = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  locale: string | null;
  pictureUrl: string | null;
  staysCount: number;
  totalSpent: number;
  currency: string;
  upcomingStays: number;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};
