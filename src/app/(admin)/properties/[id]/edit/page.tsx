import { PropertyFormPage } from '@/features/properties/components/property-form-page';

type EditPropertyRouteProps = {
  params: { id: string };
};

export default function EditPropertyRoute({ params }: EditPropertyRouteProps) {
  return <PropertyFormPage mode="edit" id={params.id} />;
}
