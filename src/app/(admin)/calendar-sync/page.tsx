import { Suspense } from 'react';
import { CalendarSyncPage } from '@/features/calendar-sync/components/calendar-sync-page';
import { PageSkeleton } from '@/shared/components/ui';

export default function CalendarSyncRoute() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" />}>
      <CalendarSyncPage />
    </Suspense>
  );
}
