import { Suspense } from 'react';
import { UnitsPage } from '@/features/units/components/units-page';
import { PageSkeleton } from '@/shared/components/ui';

export default function UnitsRoute() {
  return (
    <Suspense fallback={<PageSkeleton variant="table" />}>
      <UnitsPage />
    </Suspense>
  );
}
