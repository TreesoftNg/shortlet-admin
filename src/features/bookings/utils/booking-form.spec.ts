import {
  createEmptyBookingForm,
  estimateBookingQuote,
  nightsBetween,
  validateBookingForm,
} from './booking-form';
import type { Property, Unit } from '@/shared/types/hospitable';

const property = {
  id: 1,
  currency: 'NGN',
  capacity: { bedrooms: 2 },
  check_in: '14:00',
  check_out: '11:00',
} as Property;

const unit = {
  id: 1,
  property_id: 1,
  capacity: 4,
  base_rate: 100000,
} as Unit;

describe('booking-form utils', () => {
  it('calculates nights between dates', () => {
    expect(nightsBetween('2026-10-12', '2026-10-16')).toBe(4);
    expect(nightsBetween('2026-10-12', '2026-10-12')).toBe(0);
  });

  it('requires guest, stay, and inventory fields', () => {
    const errors = validateBookingForm(createEmptyBookingForm());
    expect(errors.guest_id).toBeTruthy();
    expect(errors.property_id).toBeTruthy();
    expect(errors.unit_id).toBeTruthy();
    expect(errors.arrival_date).toBeTruthy();
    expect(errors.departure_date).toBeTruthy();
  });

  it('validates new guest email and capacity', () => {
    const errors = validateBookingForm(
      {
        ...createEmptyBookingForm(),
        guest_mode: 'new',
        first_name: 'Ada',
        last_name: 'Okafor',
        email: 'not-an-email',
        property_id: 1,
        unit_id: 1,
        arrival_date: '2026-11-01',
        departure_date: '2026-11-04',
        adult_count: 3,
        child_count: 2,
      },
      { unit, property },
    );
    expect(errors.email).toBeTruthy();
    expect(errors.adult_count).toContain('sleeps');
  });

  it('estimates quote from nights and rate', () => {
    const quote = estimateBookingQuote(
      {
        ...createEmptyBookingForm(),
        arrival_date: '2026-11-01',
        departure_date: '2026-11-04',
      },
      unit,
      property,
    );
    expect(quote.nights).toBe(3);
    expect(quote.accommodation).toBe(300000);
    expect(quote.total).toBe(quote.accommodation + quote.cleaningFee);
  });
});
