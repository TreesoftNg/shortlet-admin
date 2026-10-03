import {
  availabilityHref,
  calendarSyncHref,
  unitMatchesAvailabilityHighlight,
} from './calendar-deep-links';

describe('calendar deep links', () => {
  it('builds availability and calendar-sync hrefs', () => {
    expect(
      availabilityHref({ unitId: 'unit-1', name: 'Charming 1bedroom' }),
    ).toBe('/availability?unitId=unit-1&unitName=Charming+1bedroom');
    expect(calendarSyncHref(3)).toBe('/calendar-sync?unitId=3');
    expect(calendarSyncHref('unit-1')).toBe('/calendar-sync?unitId=unit-1');
  });

  it('matches availability highlight by id or name', () => {
    expect(
      unitMatchesAvailabilityHighlight(
        { id: 3, name: 'Unit C' },
        '3',
        null,
      ),
    ).toBe(true);
    expect(
      unitMatchesAvailabilityHighlight(
        { id: 9, name: 'Charming 1bedroom' },
        'unit-1',
        'Charming 1bedroom',
      ),
    ).toBe(true);
    expect(
      unitMatchesAvailabilityHighlight(
        { id: 1, name: 'Other' },
        'unit-1',
        'Charming 1bedroom',
      ),
    ).toBe(false);
  });
});
