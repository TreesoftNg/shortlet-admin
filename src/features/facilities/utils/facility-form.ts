export const FACILITY_NAME_MAX = 80;
export const FACILITY_CATEGORY_MAX = 60;

export type FacilityFormValues = {
  name: string;
  category: string;
};

export type FacilityFormErrors = Partial<Record<keyof FacilityFormValues, string>>;

export function emptyFacilityForm(): FacilityFormValues {
  return { name: '', category: '' };
}

export function facilityFormFrom(
  facility: { name: string; category: string | null } | null,
): FacilityFormValues {
  if (!facility) return emptyFacilityForm();
  return {
    name: facility.name,
    category: facility.category ?? '',
  };
}

export function validateFacilityForm(values: FacilityFormValues): FacilityFormErrors {
  const errors: FacilityFormErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'Name is required';
  else if (name.length > FACILITY_NAME_MAX) {
    errors.name = `Keep the name under ${FACILITY_NAME_MAX} characters`;
  }

  const category = values.category.trim();
  if (category.length > FACILITY_CATEGORY_MAX) {
    errors.category = `Keep the category under ${FACILITY_CATEGORY_MAX} characters`;
  }

  return errors;
}

export function toFacilityInput(values: FacilityFormValues) {
  return {
    name: values.name.trim(),
    category: values.category.trim() || null,
  };
}
