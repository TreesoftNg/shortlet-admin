import { Suspense } from 'react';
import { UnitFormPage } from '@/features/units/components/unit-form-page';
import { PageSkeleton } from '@/shared/components/ui';

type EditUnitRouteProps = {
  params: { id: string };
};

export default function EditUnitRoute({ params }: EditUnitRouteProps) {
  return (
    <Suspense fallback={<PageSkeleton variant="form" />}>
      <UnitFormPage mode="edit" id={params.id} />
    </Suspense>
  );
}
