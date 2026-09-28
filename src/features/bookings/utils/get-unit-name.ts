import type { Reservation } from '@/shared/types/hospitable';
import { mockUnits } from '@/mocks/data';

export function getUnitName(reservation: Reservation): string {
  if (!reservation.unit_id) return '—';
  const unit = mockUnits.find((item) => item.id === reservation.unit_id);
  return unit?.name ?? '—';
}
