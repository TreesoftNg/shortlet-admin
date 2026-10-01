import { Suspense } from 'react';
import { AvailabilityPage } from '@/features/availability/components/availability-page';
import { PageSkeleton } from '@/shared/components/ui';

export default function AvailabilityRoute() {
  return (
    <Suspense fallback={<PageSkeleton variant="calendar" />}>
      <AvailabilityPage />
    </Suspense>
  );
}
