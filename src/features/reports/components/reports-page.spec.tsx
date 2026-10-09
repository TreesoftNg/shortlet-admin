import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { reportsData } from '@/features/dashboard/test-fixtures';
import { queryKeys } from '@/shared/api/query-keys';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as reportsApi from '../api/reports-service';
import { ReportsPage } from './reports-page';

jest.mock('../api/reports-service');
const api = jest.mocked(reportsApi);

function renderAs(permissions = ['reports.view']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'manager', name: 'Manager' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<ReportsPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchReports.mockResolvedValue(reportsData());
});

describe('ReportsPage', () => {
  it('shows the finance summary for the period', async () => {
    renderAs();
    expect(await screen.findByText('Finance summary')).toBeInTheDocument();
    const row = (label: string) => screen.getByText(label).parentElement!.parentElement!;
    expect(row('Gross revenue')).toHaveTextContent('₦950,000');
    expect(row('Stay refunds')).toHaveTextContent('₦50,000');
    expect(row('Net revenue')).toHaveTextContent('₦900,000');
    expect(row('Pending refunds')).toHaveTextContent('Waiting at Flutterwave right now₦25,000');
  });

  it('lists property performance with a total row', async () => {
    renderAs();
    const table = (await screen.findByText('Property performance')).closest('div')!.parentElement!.parentElement!;
    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Lekki₦750,000');
    expect(rows[1]).toHaveTextContent('26.7%');
    expect(rows[1]).toHaveTextContent('₦93,750');
    expect(rows.at(-1)).toHaveTextContent('Total₦900,0007');
  });

  it('shows the channel mix; Airbnb / Booking.com stays have no price', async () => {
    renderAs();
    expect(await screen.findByText('Channel mix')).toBeInTheDocument();
    expect(screen.getByText('Booked by staff')).toBeInTheDocument();
    expect(screen.getByText('57.1%')).toBeInTheDocument();
    expect(screen.getByText('2 bookings · 4 nights')).toBeInTheDocument();
    expect(screen.getByText('Price not shared')).toBeInTheDocument();
  });

  it('reloads for another period', async () => {
    renderAs();
    await screen.findByText('Finance summary');
    api.fetchReports.mockResolvedValue(reportsData({ period: '12m' }));
    await userEvent.click(screen.getByRole('radio', { name: '12M' }));
    await waitFor(() => expect(api.fetchReports).toHaveBeenLastCalledWith('12m'));
    expect(await screen.findAllByText('vs previous 12 months')).toHaveLength(4);
  });

  it('tells staff without reports access instead of loading', async () => {
    renderAs([]);
    expect(await screen.findByText('Reports are available to owners, admins and managers.')).toBeInTheDocument();
    expect(api.fetchReports).not.toHaveBeenCalled();
  });
});
