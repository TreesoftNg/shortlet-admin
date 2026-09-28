import type {
  AvailabilityCalendar,
  CalendarBar,
  CalendarRange,
  CalendarUnitRow,
} from '@/shared/types/hospitable';

export const mockCalendarUnits: CalendarUnitRow[] = [
  {
    id: 'unit-azure-a',
    property_id: 'prop-azure',
    property_name: 'Azure Lekki',
    name: 'Unit A',
    subtitle: '2 bed · 3rd floor',
  },
  {
    id: 'unit-azure-b',
    property_id: 'prop-azure',
    property_name: 'Azure Lekki',
    name: 'Unit B',
    subtitle: '2 bed · 5th floor',
  },
  {
    id: 'unit-azure-c',
    property_id: 'prop-azure',
    property_name: 'Azure Lekki',
    name: 'Unit C',
    subtitle: '2 bed · 6th floor',
  },
  {
    id: 'unit-palms-s1',
    property_id: 'prop-palms',
    property_name: 'The Palms VI',
    name: 'Studio 1',
    subtitle: '1 bed · Studio',
  },
  {
    id: 'unit-palms-s2',
    property_id: 'prop-palms',
    property_name: 'The Palms VI',
    name: 'Studio 2',
    subtitle: '1 bed · Studio',
  },
  {
    id: 'unit-maitama-1',
    property_id: 'prop-maitama',
    property_name: 'Maitama Abuja',
    name: 'Unit 1',
    subtitle: '2 bed · Garden',
  },
  {
    id: 'unit-maitama-3',
    property_id: 'prop-maitama',
    property_name: 'Maitama Abuja',
    name: 'Unit 3',
    subtitle: '3 bed · Penthouse',
  },
];

const barsForWindow: CalendarBar[] = [
  {
    id: 'bar-1',
    unit_id: 'unit-azure-a',
    start_date: '2026-09-26',
    end_date: '2026-09-28',
    kind: 'checked_in',
    label: 'Sarah J.',
    initials: 'SJ',
    source: null,
  },
  {
    id: 'bar-2',
    unit_id: 'unit-azure-a',
    start_date: '2026-09-29',
    end_date: '2026-10-01',
    kind: 'awaiting_payment',
    label: 'Chidi O. · awaiting',
    initials: null,
    source: null,
  },
  {
    id: 'bar-3',
    unit_id: 'unit-azure-a',
    start_date: '2026-10-04',
    end_date: '2026-10-09',
    kind: 'confirmed',
    label: 'Ngozi Eze · 5 nights',
    initials: 'NE',
    source: null,
  },
  {
    id: 'bar-4',
    unit_id: 'unit-azure-b',
    start_date: '2026-09-27',
    end_date: '2026-09-30',
    kind: 'external',
    label: 'Airbnb · via Hospitable',
    initials: 'A',
    source: 'hospitable',
  },
  {
    id: 'bar-5',
    unit_id: 'unit-azure-b',
    start_date: '2026-10-02',
    end_date: '2026-10-05',
    kind: 'confirmed',
    label: 'Tunde B.',
    initials: 'TB',
    source: null,
  },
  {
    id: 'bar-6',
    unit_id: 'unit-azure-c',
    start_date: '2026-09-28',
    end_date: '2026-09-30',
    kind: 'blocked',
    label: 'Maintenance',
    initials: null,
    source: 'user',
  },
  {
    id: 'bar-7',
    unit_id: 'unit-azure-c',
    start_date: '2026-10-01',
    end_date: '2026-10-08',
    kind: 'confirmed',
    label: 'James Obi · 7 nights',
    initials: 'JO',
    source: null,
  },
  {
    id: 'bar-8',
    unit_id: 'unit-palms-s1',
    start_date: '2026-09-26',
    end_date: '2026-09-29',
    kind: 'confirmed',
    label: 'Aisha Bello',
    initials: 'AB',
    source: null,
  },
  {
    id: 'bar-9',
    unit_id: 'unit-palms-s1',
    start_date: '2026-10-03',
    end_date: '2026-10-06',
    kind: 'confirmed',
    label: 'Kunle E.',
    initials: 'KE',
    source: null,
  },
  {
    id: 'bar-10',
    unit_id: 'unit-palms-s2',
    start_date: '2026-09-30',
    end_date: '2026-10-03',
    kind: 'confirmed',
    label: 'Funmi Ade',
    initials: 'FA',
    source: null,
  },
  {
    id: 'bar-11',
    unit_id: 'unit-palms-s2',
    start_date: '2026-10-06',
    end_date: '2026-10-09',
    kind: 'external',
    label: 'Booking.com',
    initials: 'B',
    source: 'hospitable',
  },
  {
    id: 'bar-12',
    unit_id: 'unit-maitama-1',
    start_date: '2026-09-26',
    end_date: '2026-10-02',
    kind: 'checked_in',
    label: 'Ibrahim M. · 6 nights',
    initials: 'IM',
    source: null,
  },
  {
    id: 'bar-13',
    unit_id: 'unit-maitama-3',
    start_date: '2026-10-05',
    end_date: '2026-10-09',
    kind: 'blocked',
    label: 'Owner stay',
    initials: null,
    source: 'user',
  },
];

function buildNightlyRates(startDate: string, days: number): Record<string, number> {
  const rates: Record<string, number> = {};
  const start = new Date(`${startDate}T00:00:00`);

  for (let i = 0; i < days; i += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const weekday = date.getDay();
    rates[key] = weekday === 5 || weekday === 6 ? 95000 : 85000;
  }

  return rates;
}

export function buildMockAvailabilityCalendar(
  anchorDate = '2026-09-26',
  range: CalendarRange = '2weeks',
  propertyId: string | 'all' = 'all',
): AvailabilityCalendar {
  const dayCount = range === 'week' ? 7 : range === 'month' ? 30 : 14;
  const start = new Date(`${anchorDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + dayCount - 1);

  const startDate = start.toISOString().slice(0, 10);
  const endDate = end.toISOString().slice(0, 10);

  const units =
    propertyId === 'all'
      ? mockCalendarUnits
      : mockCalendarUnits.filter((unit) => unit.property_id === propertyId);

  const unitIds = new Set(units.map((unit) => unit.id));

  return {
    anchor_date: anchorDate,
    range,
    start_date: startDate,
    end_date: endDate,
    today: '2026-09-26',
    currency: 'NGN',
    nightly_rates: buildNightlyRates(startDate, dayCount),
    units,
    bars: barsForWindow.filter((bar) => unitIds.has(bar.unit_id)),
  };
}

export const mockAvailabilityCalendar = buildMockAvailabilityCalendar();
