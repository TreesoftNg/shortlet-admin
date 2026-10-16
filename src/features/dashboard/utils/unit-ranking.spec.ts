import { manyUnits, unitPerformance } from '../test-fixtures';
import {
  lowestOccupancyUnits,
  rankUnits,
  searchUnits,
  showProperty,
  sortUnits,
  unitLabel,
  unitPropertyLabel,
  unitTotals,
} from './unit-ranking';

const names = (rows: Array<{ unitName: string }>) => rows.map((row) => row.unitName);

const garden = unitPerformance({ unitId: 'a', unitName: 'Garden', revenue: 300, bookings: 1, nights: 4, occupancyPercent: 40 });
const harbour = unitPerformance({ unitId: 'b', unitName: 'Harbour', revenue: 500, bookings: 3, nights: 2, occupancyPercent: null });
const loft = unitPerformance({ unitId: 'c', unitName: 'Loft', revenue: 300, bookings: 3, nights: 6, occupancyPercent: 60 });
const annex = unitPerformance({ unitId: 'd', unitName: 'Annex', revenue: 100, bookings: 0, nights: 1, occupancyPercent: 10 });
const units = [garden, harbour, loft, annex];

describe('unit ranking', () => {
  it('ranks by revenue, breaking ties by name', () => {
    expect(names(rankUnits(units, 'revenue', 5))).toEqual(['Harbour', 'Garden', 'Loft', 'Annex']);
  });

  it('ranks by occupancy with units that had no open nights last', () => {
    expect(names(rankUnits(units, 'occupancy', 5))).toEqual(['Loft', 'Garden', 'Annex', 'Harbour']);
  });

  it('ranks by bookings, breaking ties by revenue', () => {
    expect(names(rankUnits(units, 'bookings', 5))).toEqual(['Harbour', 'Loft', 'Garden', 'Annex']);
  });

  it('keeps only the top units and leaves the input alone', () => {
    const rows = manyUnits(12);
    expect(names(rankUnits(rows, 'occupancy', 3))).toEqual(['Unit 12', 'Unit 11', 'Unit 10']);
    expect(rows[0].unitName).toBe('Unit 1');
  });

  it('lists the lowest occupancy first and skips units with no figure', () => {
    expect(names(lowestOccupancyUnits(units, 2))).toEqual(['Annex', 'Garden']);
    expect(names(lowestOccupancyUnits(units, 5))).toEqual(['Annex', 'Garden', 'Loft']);
  });

  it('searches name, code and property, ignoring case and spaces', () => {
    const rows = [
      unitPerformance({ unitId: 'a', unitName: 'Garden Suite', unitCode: 'GRA-01', propertyName: 'Sunmade Ikeja GRA' }),
      unitPerformance({ unitId: 'b', unitName: 'Harbour Suite', unitCode: null, propertyName: 'Sunmade Lekki' }),
      unitPerformance({ unitId: 'c', unitName: 'Studio', unitCode: 'LKK-02', propertyName: null }),
    ];
    expect(names(searchUnits(rows, '  suite '))).toEqual(['Garden Suite', 'Harbour Suite']);
    expect(names(searchUnits(rows, 'lkk'))).toEqual(['Studio']);
    expect(names(searchUnits(rows, 'LEKKI'))).toEqual(['Harbour Suite']);
    expect(searchUnits(rows, '   ')).toBe(rows);
    expect(searchUnits(rows, 'nowhere')).toEqual([]);
  });

  it('sorts table columns either way, keeping units without occupancy last', () => {
    expect(names(sortUnits(units, 'unit', 'asc'))).toEqual(['Annex', 'Garden', 'Harbour', 'Loft']);
    expect(names(sortUnits(units, 'unit', 'desc'))).toEqual(['Loft', 'Harbour', 'Garden', 'Annex']);
    expect(names(sortUnits(units, 'revenue', 'desc'))).toEqual(['Harbour', 'Garden', 'Loft', 'Annex']);
    expect(names(sortUnits(units, 'nights', 'asc'))).toEqual(['Annex', 'Harbour', 'Garden', 'Loft']);
    expect(names(sortUnits(units, 'occupancy', 'desc'))).toEqual(['Loft', 'Garden', 'Annex', 'Harbour']);
    expect(names(sortUnits(units, 'occupancy', 'asc'))).toEqual(['Annex', 'Garden', 'Loft', 'Harbour']);
  });

  it('sorts names naturally', () => {
    expect(names(sortUnits(manyUnits(12), 'unit', 'asc')).slice(0, 3)).toEqual(['Unit 1', 'Unit 2', 'Unit 3']);
    expect(names(sortUnits(manyUnits(12), 'unit', 'desc'))[0]).toBe('Unit 12');
  });

  it('adds up revenue, bookings and nights', () => {
    expect(unitTotals(units)).toEqual({ revenue: 1200, bookings: 7, nights: 13 });
    expect(unitTotals([])).toEqual({ revenue: 0, bookings: 0, nights: 0 });
  });

  it('labels units and their property', () => {
    expect(unitLabel({ unitName: 'Garden Suite', unitCode: 'GRA-01' })).toBe('Garden Suite (GRA-01)');
    expect(unitLabel({ unitName: 'Garden Suite', unitCode: null })).toBe('Garden Suite');
    expect(unitPropertyLabel({ propertyName: 'Sunmade Lekki' })).toBe('Sunmade Lekki');
    expect(unitPropertyLabel({ propertyName: null })).toBe('Unassigned');
  });

  it('shows property names only with more than one property', () => {
    expect(showProperty(0)).toBe(false);
    expect(showProperty(1)).toBe(false);
    expect(showProperty(2)).toBe(true);
  });
});
