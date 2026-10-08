import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import * as bookingsApi from '@/features/bookings/api/bookings-service';
import { bookingListItem } from '@/features/bookings/test-fixtures';
import { queryKeys } from '@/shared/api/query-keys';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as dashboardApi from '../api/dashboard-service';
import { dashboardData, kpis } from '../test-fixtures';
import { DashboardPage } from './dashboard-page';

jest.mock('../api/dashboard-service');
jest.mock('@/features/bookings/api/bookings-service');

const api = jest.mocked(dashboardApi);
const bookings = jest.mocked(bookingsApi);

function renderAs(permissions = ['reports.view', 'booking.read']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<DashboardPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchDashboard.mockResolvedValue(dashboardData());
  bookings.fetchBookings.mockResolvedValue({
    items: [bookingListItem({ reference: 'RECENT0001' })],
    page: 1,
    limit: 5,
    total: 1,
    totalPages: 1,
  });
});

describe('DashboardPage', () => {
  it('greets the user and shows KPIs against the previous period', async () => {
    renderAs();
    expect(await screen.findByText('₦900,000')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/, Ada$/);
    expect(screen.getAllByText('Last 30 days · 10 Sept – 9 Oct 2026').length).toBeGreaterThan(0);
    expect(screen.getByText('+350%')).toBeInTheDocument();
    expect(screen.getByText('−8%')).toBeInTheDocument();
    expect(screen.getByText('No earlier data')).toBeInTheDocument();
    expect(screen.getAllByText('vs previous 30 days')).toHaveLength(4);
    expect(screen.getAllByText('27.6%')).toHaveLength(2); // KPI card and occupancy panel
    expect(screen.getByText('₦81,818')).toBeInTheDocument();
  });

  it('reloads every figure for the chosen period', async () => {
    renderAs();
    await screen.findByText('₦900,000');
    expect(api.fetchDashboard).toHaveBeenCalledWith('30d');
    api.fetchDashboard.mockResolvedValue(
      dashboardData({ period: '7d', keyPerformanceIndicators: kpis({ revenue: { value: 120000, previous: 0, changePercent: null } }) }),
    );
    await userEvent.click(screen.getByRole('radio', { name: '7D' }));
    expect(await screen.findByText('₦120,000')).toBeInTheDocument();
    expect(api.fetchDashboard).toHaveBeenLastCalledWith('7d');
    expect(screen.getAllByText('vs previous 7 days').length).toBeGreaterThan(0);
  });

  it('shows occupancy by property, today, and recent bookings', async () => {
    renderAs();
    expect(await screen.findByText('Occupancy by property')).toBeInTheDocument();
    expect(screen.getByText('8 of 28 nights')).toBeInTheDocument();
    expect(screen.getByText('Arriving Airbnb Guest')).toBeInTheDocument();
    expect(screen.getByText('Ikeja · Unit B')).toBeInTheDocument();
    expect(screen.getByText('No departures today.')).toBeInTheDocument();
    expect(await screen.findByText('RECENT0001')).toBeInTheDocument();
    expect(bookings.fetchBookings).toHaveBeenCalledWith({ page: 1, limit: 5 });
  });

  it('notes revenue in other currencies that the totals leave out', async () => {
    api.fetchDashboard.mockResolvedValue(dashboardData({ otherCurrencies: [{ currency: 'USD', revenue: 300, bookings: 1 }] }));
    renderAs();
    expect(await screen.findByText(/Not included: US\$300 from 1 booking\./)).toBeInTheDocument();
  });

  it('shows when there is no revenue yet', async () => {
    api.fetchDashboard.mockResolvedValue(
      dashboardData({
        revenueOverview: [{ date: '2026-10-09', label: '9 Oct', amount: 0, previousAmount: 0 }],
      }),
    );
    renderAs();
    expect(await screen.findByText('No revenue in this period yet')).toBeInTheDocument();
  });

  it('does not load business figures for staff without reports access', async () => {
    renderAs(['booking.read']);
    expect(await screen.findByText(/available to owners, admins and managers/)).toBeInTheDocument();
    expect(await screen.findByText('RECENT0001')).toBeInTheDocument();
    await waitFor(() => expect(api.fetchDashboard).not.toHaveBeenCalled());
  });
});
