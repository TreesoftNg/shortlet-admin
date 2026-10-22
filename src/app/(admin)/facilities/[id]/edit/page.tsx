import { FacilityFormPage } from '@/features/facilities/components/facility-form-page';

type EditFacilityRouteProps = {
  params: { id: string };
};

export default function EditFacilityRoute({ params }: EditFacilityRouteProps) {
  return <FacilityFormPage mode="edit" id={params.id} />;
}
