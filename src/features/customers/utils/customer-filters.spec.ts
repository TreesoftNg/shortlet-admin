import {
  buildCustomerList,
  countCustomerTabs,
  DEFAULT_CUSTOMER_FILTERS,
  filterCustomers,
  getCustomerLocations,
} from './customer-filters';
import { mockGuests, mockReservations } from '@/mocks/data';

describe('customer-filters', () => {
  const customers = buildCustomerList(mockGuests, mockReservations);

  it('builds customers with stay aggregates', () => {
    const temitope = customers.find((item) => item.id === 'gst-001');
    expect(temitope?.stays_count).toBeGreaterThan(0);
    expect(temitope?.total_spent).toBeGreaterThan(0);
  });

  it('counts tabs', () => {
    const counts = countCustomerTabs(customers);
    expect(counts.all).toBe(customers.length);
    expect(counts.with_stays + counts.new).toBe(counts.all);
  });

  it('filters by search', () => {
    const result = filterCustomers(customers, {
      ...DEFAULT_CUSTOMER_FILTERS,
      search: 'sarah',
    });
    expect(result).toHaveLength(1);
    expect(result[0].full_name).toBe('Sarah Johnson');
  });

  it('returns sorted locations', () => {
    const locations = getCustomerLocations(customers);
    expect(locations.length).toBeGreaterThan(0);
    expect(locations).toEqual([...locations].sort());
  });
});
