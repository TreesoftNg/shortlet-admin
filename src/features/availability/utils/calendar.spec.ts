import {
  addDays,
  eachDateInRange,
  formatDateOnly,
  formatRangeLabel,
  getBarLayout,
  groupUnitsByProperty,
  isWeekend,
} from './calendar';

describe('calendar utils', () => {
  it('iterates inclusive date ranges', () => {
    expect(eachDateInRange('2026-09-26', '2026-09-28')).toEqual([
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
    ]);
  });

  it('adds days and formats date-only values', () => {
    expect(addDays('2026-09-26', 14)).toBe('2026-10-10');
    expect(formatDateOnly(new Date(2026, 8, 26))).toBe('2026-09-26');
  });

  it('detects weekends', () => {
    expect(isWeekend('2026-09-26')).toBe(true); // Saturday
    expect(isWeekend('2026-09-28')).toBe(false); // Monday
  });

  it('formats visible range labels', () => {
    expect(formatRangeLabel('2026-09-26', '2026-10-09')).toContain('Sep 26');
    expect(formatRangeLabel('2026-09-26', '2026-10-09')).toContain('Oct 9');
  });

  it('computes bar layout within the visible window', () => {
    const dates = eachDateInRange('2026-09-26', '2026-10-09');
    const layout = getBarLayout('2026-09-26', '2026-09-28', dates);
    expect(layout).toEqual({
      startIndex: 0,
      spanDays: 2,
      leftPercent: 50,
      widthCalc: 'calc(200% - 4px)',
    });
  });

  it('returns null when bar is outside the window', () => {
    const dates = eachDateInRange('2026-09-26', '2026-10-09');
    expect(getBarLayout('2026-09-01', '2026-09-03', dates)).toBeNull();
  });

  it('groups units by property', () => {
    const groups = groupUnitsByProperty([
      {
        property_id: 'p1',
        property_name: 'Azure',
        id: 'u1',
      },
      {
        property_id: 'p1',
        property_name: 'Azure',
        id: 'u2',
      },
      {
        property_id: 'p2',
        property_name: 'Palms',
        id: 'u3',
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].units).toHaveLength(2);
    expect(groups[1].propertyName).toBe('Palms');
  });
});
