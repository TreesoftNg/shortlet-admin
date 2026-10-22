'use client';

import { useFacilitiesCatalog } from './use-facilities-catalog';

/** One facility from the catalog cache (API has no GET-by-id). */
export function useFacility(id: string | undefined) {
  const query = useFacilitiesCatalog({ enabled: Boolean(id) });
  const facility = id
    ? (query.data?.find((row) => row.id === id) ?? null)
    : null;

  return {
    ...query,
    data: facility,
  };
}
