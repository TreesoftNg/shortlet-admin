import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import * as bookingsApi from '@/features/bookings/api/bookings-service';
import { bookingListItem } from '@/features/bookings/test-fixtures';
import { queryKeys } from '@/shared/api/query-keys';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as dashboardApi from '../api/dashboard-service';
import { dashboardData, kpis, manyUnits, twoPropertyUnits, unitPerformance, withUnits } from '../test-fixtures';
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
    items: [bookingListItem({ guestName: 'Recent Guest' })],
    page: 1,
    limit: 5,
    total: 1,
    totalPages: 1,
  });
});

function topUnitRows() {
  return within(screen.getByRole('list', { name: 'Top units' })).getAllByRole('listitem');
}

/** The top units list shows exactly `names`, in order. */
function expectTopUnits(names: string[]) {
  const rows = topUnitRows();
  expect(rows).toHaveLength(names.length);
  names.forEach((name, index) => expect(within(rows[index]).getByText(name)).toBeInTheDocument());
}

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
    expect(screen.getAllByText('27.6%')).toHaveLength(1); // overall occupancy is on the KPI card only
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

  it('shows top units, today, and recent bookings', async () => {
    renderAs();
    expect(await screen.findByRole('heading', { name: 'Top units' })).toBeInTheDocument();
    expect(screen.getByText('4 units · Last 30 days')).toBeInTheDocument();
    expectTopUnits(['Garden Suite', 'Pool View Studio', 'Courtyard Loft', 'Penthouse']);
    const first = topUnitRows()[0];
    expect(first).toHaveTextContent('GRA-01');
    expect(first).toHaveTextContent('₦450,000');
    expect(first).toHaveTextContent('11 of 30 nights');
    expect(screen.queryByRole('link', { name: /View all \d+ units/ })).not.toBeInTheDocument();
    expect(screen.getByText('Arriving Airbnb Guest')).toBeInTheDocument();
    // One property, so neither list repeats its name.
    expect(screen.getAllByText('Pool View Studio')).toHaveLength(2);
    expect(screen.queryByText(/Sunmade Ikeja GRA/)).not.toBeInTheDocument();
    expect(screen.getByText('No departures today.')).toBeInTheDocument();
    expect(await screen.findByText('Recent Guest')).toBeInTheDocument();
    expect(bookings.fetchBookings).toHaveBeenCalledWith({ page: 1, limit: 5 });
  });

  it('shows the top 5 units and links to all of them', async () => {
    api.fetchDashboard.mockResolvedValue(dashboardData(withUnits(manyUnits(12))));
    renderAs();
    expect(await screen.findByText('Top 5 of 12 units · Last 30 days')).toBeInTheDocument();
    expectTopUnits(['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5']);
    expect(screen.getByRole('link', { name: 'View all 12 units' })).toHaveAttribute('href', '/reports#units');
  });

  it('re-ranks units by occupancy or bookings', async () => {
    api.fetchDashboard.mockResolvedValue(dashboardData(withUnits(manyUnits(12))));
    renderAs();
    await screen.findByText('Top 5 of 12 units · Last 30 days');
    const ranking = screen.getByRole('radiogroup', { name: 'Rank units by' });
    expect(within(ranking).getByRole('radio', { name: 'Revenue' })).toHaveAttribute('aria-checked', 'true');

    await userEvent.click(within(ranking).getByRole('radio', { name: 'Occupancy' }));
    expectTopUnits(['Unit 12', 'Unit 11', 'Unit 10', 'Unit 9', 'Unit 8']);
    expect(topUnitRows()[0]).toHaveTextContent('43.3%');

    await userEvent.click(within(ranking).getByRole('radio', { name: 'Bookings' }));
    expectTopUnits(['Unit 3', 'Unit 6', 'Unit 9', 'Unit 12', 'Unit 2']);
    expect(topUnitRows()[0]).toHaveTextContent('3 bookings');
    expect(api.fetchDashboard).toHaveBeenCalledTimes(1);
  });

  it('marks archived units and units with no open nights', async () => {
    api.fetchDashboard.mockResolvedValue(
      dashboardData(
        withUnits([
          unitPerformance(),
          unitPerformance({
            unitId: 'u9',
            unitName: 'Old Annex',
            unitCode: null,
            archived: true,
            revenue: 50000,
            occupancyPercent: null,
            occupiedNights: 0,
            availableNights: 0,
          }),
        ]),
      ),
    );
    renderAs();
    await screen.findByText('2 units · Last 30 days');
    const annex = topUnitRows()[1];
    expect(annex).toHaveTextContent('Archived');
    expect(annex).toHaveTextContent('No open nights');
    await userEvent.click(screen.getByRole('radio', { name: 'Occupancy' }));
    expect(topUnitRows()[1]).toHaveTextContent('Old Annex');
    expect(topUnitRows()[1]).toHaveTextContent('—');
  });

  it('names the property of each unit when there is more than one', async () => {
    api.fetchDashboard.mockResolvedValue(dashboardData(withUnits(twoPropertyUnits())));
    renderAs();
    await screen.findByText('4 units · Last 30 days');
    expect(topUnitRows()[1]).toHaveTextContent('Harbour Suite');
    expect(topUnitRows()[1]).toHaveTextContent('Sunmade Lekki');
    expect(screen.getByText('Sunmade Ikeja GRA · Pool View Studio')).toBeInTheDocument();
  });

  it('says so when no units were open', async () => {
    api.fetchDashboard.mockResolvedValue(dashboardData(withUnits([])));
    renderAs();
    expect(await screen.findByText('No units were open in this period.')).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Rank units by' })).not.toBeInTheDocument();
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
    expect(await screen.findByText('Recent Guest')).toBeInTheDocument();
    await waitFor(() => expect(api.fetchDashboard).not.toHaveBeenCalled());
  });
});
