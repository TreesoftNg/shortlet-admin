import { PropertyFormPage } from '@/features/properties/components/property-form-page';
import { notFound } from 'next/navigation';

type EditPropertyRouteProps = {
  params: { id: string };
};

export default function EditPropertyRoute({ params }: EditPropertyRouteProps) {
  const id = Number(params.id);
  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  return <PropertyFormPage mode="edit" id={id} />;
}
