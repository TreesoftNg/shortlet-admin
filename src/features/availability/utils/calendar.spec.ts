import {
  addDays,
  eachDateInRange,
  formatDateOnly,
  formatRangeLabel,
  getBarLayout,
  groupUnitsByProperty,
  isWeekend,
  calendarWindow,
  coversNight,
  getEventLayout,
  selectNights,
  todayInLagos,
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

  it('groups units by property, with units without one last', () => {
    const groups = groupUnitsByProperty([
      { id: 'u0', propertyId: null, propertyName: null },
      { id: 'u1', propertyId: 'p1', propertyName: 'Azure' },
      { id: 'u2', propertyId: 'p1', propertyName: 'Azure' },
      { id: 'u3', propertyId: 'p2', propertyName: 'Palms' },
    ]);

    expect(groups.map((group) => [group.propertyName, group.units.length])).toEqual([
      ['Azure', 2],
      ['Palms', 1],
      ['No property', 1],
    ]);
  });

  it('builds the visible window and today in Lagos', () => {
    expect(calendarWindow('2026-10-06', 'week')).toEqual({ from: '2026-10-06', to: '2026-10-13' });
    expect(calendarWindow('2026-10-06', 'month').to).toBe('2026-11-06');
    expect(todayInLagos(new Date('2026-10-05T23:30:00Z'))).toBe('2026-10-06');
  });

  describe('getEventLayout', () => {
    const nights = eachDateInRange('2026-10-06', '2026-10-12'); // 7 nights

    it('runs from midday of the first night to midday of check-out', () => {
      expect(getEventLayout('2026-10-07', '2026-10-09', nights)).toMatchObject({
        startIndex: 1,
        leftPercent: 50,
        widthCalc: 'calc(200% - 4px)',
        clippedStart: false,
        clippedEnd: false,
      });
    });

    it('keeps stays that cross the window edges, drawn to the edge', () => {
      expect(getEventLayout('2026-10-03', '2026-10-08', nights)).toMatchObject({
        startIndex: 0,
        leftPercent: 0,
        widthCalc: 'calc(250% - 4px)',
        clippedStart: true,
      });
      expect(getEventLayout('2026-10-11', '2026-10-20', nights)).toMatchObject({
        startIndex: 5,
        widthCalc: 'calc(150% - 4px)',
        clippedEnd: true,
      });
      expect(getEventLayout('2026-10-12', '2026-10-13', nights)).toMatchObject({
        startIndex: 6,
        widthCalc: 'calc(50% - 4px)',
        clippedEnd: true,
      });
      expect(getEventLayout('2026-10-01', '2026-10-30', nights)).toMatchObject({
        startIndex: 0,
        widthCalc: 'calc(700% - 4px)',
      });
    });

    it('skips stays outside the window', () => {
      expect(getEventLayout('2026-10-01', '2026-10-06', nights)).toBeNull();
      expect(getEventLayout('2026-10-13', '2026-10-15', nights)).toBeNull();
    });
  });

  it('selects free nights only, as [start, check-out)', () => {
    const taken = new Set(['2026-10-09']);
    const isFree = (night: string) => !taken.has(night);

    expect(selectNights('2026-10-06', '2026-10-08', isFree)).toEqual({
      startDate: '2026-10-06',
      endDate: '2026-10-09',
    });
    expect(selectNights('2026-10-08', '2026-10-06', isFree)?.startDate).toBe('2026-10-06');
    expect(selectNights('2026-10-08', '2026-10-10', isFree)).toBeNull();
    expect(coversNight({ startDate: '2026-10-07', endDate: '2026-10-09' }, '2026-10-09')).toBe(false);
  });
});
