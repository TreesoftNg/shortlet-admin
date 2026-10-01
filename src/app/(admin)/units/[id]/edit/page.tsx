import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { UnitFormPage } from '@/features/units/components/unit-form-page';
import { PageSkeleton } from '@/shared/components/ui';

type EditUnitRouteProps = {
  params: { id: string };
};

export default function EditUnitRoute({ params }: EditUnitRouteProps) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  return (
    <Suspense fallback={<PageSkeleton variant="form" />}>
      <UnitFormPage mode="edit" id={id} />
    </Suspense>
  );
}
