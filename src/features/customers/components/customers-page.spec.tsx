import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as customersApi from '../api/customers-service';
import { customer } from '../test-fixtures';
import { CustomersPage } from './customers-page';

jest.mock('../api/customers-service');
const api = jest.mocked(customersApi);

function renderAs(permissions = ['customer.read']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<CustomersPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchCustomers.mockResolvedValue([
    customer(),
    customer({
      id: 'cust-2',
      fullName: 'Temitope Aladesiun',
      email: 'temitope@example.com',
      staysCount: 2,
      status: 'guest',
    }),
  ]);
});

describe('CustomersPage', () => {
  it('lists customers from the API', async () => {
    renderAs();
    expect(await screen.findByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Temitope Aladesiun')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add customer/i })).not.toBeInTheDocument();
  });

  it('hides the list without customer.read', async () => {
    renderAs([]);
    expect(await screen.findByText('No access')).toBeInTheDocument();
    expect(api.fetchCustomers).not.toHaveBeenCalled();
  });

  it('shows an API error', async () => {
    api.fetchCustomers.mockRejectedValue(
      new ApiClientError('Customers unavailable', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderAs();
    expect(await screen.findByText('Customers unavailable')).toBeInTheDocument();
  });

  it('opens the drawer without mock bookings', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('Sarah Johnson'));
    expect(await screen.findByText('No bookings yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Message/i })).not.toBeInTheDocument();
  });
});
