import {
  countCustomerTabs,
  DEFAULT_CUSTOMER_FILTERS,
  filterCustomers,
  getCustomerLocations,
} from './customer-filters';
import { customer } from '../test-fixtures';

const customers = [
  customer(),
  customer({
    id: 'cust-2',
    firstName: 'Temitope',
    lastName: 'Aladesiun',
    fullName: 'Temitope Aladesiun',
    email: 'temitope@example.com',
    location: 'Ikeja',
    staysCount: 2,
    totalSpent: 180000,
    status: 'guest',
  }),
];

describe('customer-filters', () => {
  it('counts tabs from API status and stays', () => {
    const counts = countCustomerTabs(customers);
    expect(counts.all).toBe(2);
    expect(counts.with_stays).toBe(1);
    expect(counts.new).toBe(1);
  });

  it('filters by search', () => {
    const result = filterCustomers(customers, {
      ...DEFAULT_CUSTOMER_FILTERS,
      search: 'sarah',
    });
    expect(result).toHaveLength(1);
    expect(result[0].fullName).toBe('Sarah Johnson');
  });

  it('returns sorted locations', () => {
    expect(getCustomerLocations(customers)).toEqual(['Ikeja', 'Lekki']);
  });
});
