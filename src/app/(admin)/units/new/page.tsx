import { Suspense } from 'react';
import { UnitFormPage } from '@/features/units/components/unit-form-page';
import { PageSkeleton } from '@/shared/components/ui';

export default function NewUnitRoute() {
  return (
    <Suspense fallback={<PageSkeleton variant="form" />}>
      <UnitFormPage mode="create" />
    </Suspense>
  );
}
