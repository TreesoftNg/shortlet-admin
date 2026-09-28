import { mockReservations } from '@/mocks/data';
import {
  formatMoney,
  formatStayDates,
  getPaymentDisplayStatus,
  getReservationDisplayStatus,
  mapPaymentStatusTone,
} from '@/features/bookings/utils/reservation-display';

describe('reservation-display', () => {
  it('maps confirmed reservation status', () => {
    const status = getReservationDisplayStatus(mockReservations[0]);
    expect(status).toEqual({ label: 'Confirmed', tone: 'brand' });
  });

  it('maps awaiting payment status', () => {
    const status = getReservationDisplayStatus(mockReservations[1]);
    expect(status).toEqual({ label: 'Awaiting payment', tone: 'warn' });
  });

  it('maps cancelled reservation and refunded payment', () => {
    const reservation = mockReservations[3];
    expect(getReservationDisplayStatus(reservation)).toEqual({
      label: 'Cancelled',
      tone: 'danger',
    });
    expect(getPaymentDisplayStatus(reservation)).toEqual({
      label: 'Refunded',
      tone: 'danger',
    });
  });

  it('formats NGN money without decimals', () => {
    expect(formatMoney(417500, 'NGN')).toContain('417,500');
  });

  it('formats stay date ranges', () => {
    expect(formatStayDates('2026-10-12', '2026-10-16')).toBe('12 Oct – 16');
  });

  it('maps payment status tones', () => {
    expect(mapPaymentStatusTone('SUCCESS')).toBe('ok');
    expect(mapPaymentStatusTone('PENDING')).toBe('warn');
    expect(mapPaymentStatusTone('REFUNDED')).toBe('danger');
  });
});
