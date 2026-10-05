import { redirect } from 'next/navigation';

/** Refunds live on booking/payment detail; deposit queue is on Bookings. */
export default function RefundsRoute() {
  redirect('/bookings?tab=deposits_due');
}
