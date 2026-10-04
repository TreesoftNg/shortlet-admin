export type ReviewStatus = 'pending' | 'published' | 'hidden';

/** One row from GET /cc/reviews. */
export type Review = {
  id: string;
  unitId: string;
  unitName: string;
  customerId: string;
  guestFirstName: string;
  guestLastName: string;
  guestFullName: string;
  guestEmail: string;
  rating: number;
  comment: string | null;
  status: ReviewStatus;
  adminResponse: string | null;
  respondedAt: string | null;
  canRespond: boolean;
  createdAt: string;
};
