import type { Facility } from '../types';

export type FacilityStatusTab = 'all' | 'active' | 'archived';

export type FacilityFilters = {
  tab: FacilityStatusTab;
  search: string;
};

export const DEFAULT_FACILITY_FILTERS: FacilityFilters = {
  tab: 'all',
  search: '',
};

export function filterFacilities(
  facilities: Facility[],
  filters: FacilityFilters,
): Facility[] {
  const needle = filters.search.trim().toLowerCase();
  return facilities.filter((facility) => {
    if (filters.tab === 'active' && facility.status !== 'active') return false;
    if (filters.tab === 'archived' && facility.status !== 'archived') return false;
    if (!needle) return true;
    return (
      facility.name.toLowerCase().includes(needle) ||
      (facility.category?.toLowerCase().includes(needle) ?? false)
    );
  });
}

export function countFacilityTabs(facilities: Facility[]) {
  return {
    all: facilities.length,
    active: facilities.filter((item) => item.status === 'active').length,
    archived: facilities.filter((item) => item.status === 'archived').length,
  };
}
