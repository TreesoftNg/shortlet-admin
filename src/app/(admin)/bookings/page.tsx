import { Suspense } from 'react';
import { BookingsPage } from '@/features/bookings/components/bookings-page';
import { PageSkeleton } from '@/shared/components/ui';

export default function BookingsRoute() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" />}>
      <BookingsPage />
    </Suspense>
  );
}
