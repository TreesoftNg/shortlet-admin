import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import {
  createTestQueryClient,
  renderWithProviders,
} from '@/test-utils/render-with-providers';
import * as bookingsApi from '../api/bookings-service';
import { adminBooking, bookingListItem } from '../test-fixtures';
import { BookingsPage } from './bookings-page';

jest.mock('../api/bookings-service');
jest.mock('@/features/properties/hooks/use-properties', () => ({
  useProperties: () => ({
    data: [{ id: '33333333-3333-3333-3333-333333333333', name: 'Lekki House' }],
  }),
}));
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

const api = jest.mocked(bookingsApi);

function renderAs(permissions = ['booking.read', 'booking.update', 'booking.cancel', 'payment.refund']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: {
      id: 'u1',
      email: 'ada@example.com',
      firstName: 'Ada',
      lastName: 'Okafor',
    },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<BookingsPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchBookings.mockResolvedValue({
    items: [bookingListItem()],
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  });
  api.fetchBooking.mockResolvedValue(adminBooking());
  api.checkInBooking.mockResolvedValue(adminBooking({ status: 'checked_in' }));
  api.cancelBooking.mockResolvedValue(
    adminBooking({ status: 'cancelled', cancellationReason: 'Water outage' }),
  );
  api.releaseDeposit.mockResolvedValue(
    adminBooking({
      deposit: {
        amount: '70000.00',
        nights: 1,
        status: 'refunded',
        refunded: '70000.00',
        dueAt: null,
        deductionReason: null,
        settledAt: '2026-10-14T12:00:00.000Z',
      },
    }),
  );
});

describe('BookingsPage', () => {
  it('lists bookings from the API', async () => {
    renderAs();
    expect(await screen.findByText('ada@example.com')).toBeInTheDocument();
    expect(screen.queryByText('SM-ABC123')).not.toBeInTheDocument();
    expect(screen.getByText('Ada Okafor')).toBeInTheDocument();
    expect(api.fetchBookings).toHaveBeenCalled();
  });

  it('blocks access without booking.read', async () => {
    renderAs([]);
    expect(await screen.findByText('No access')).toBeInTheDocument();
    expect(api.fetchBookings).not.toHaveBeenCalled();
  });

  it('does not show create booking', async () => {
    renderAs();
    await screen.findByText('ada@example.com');
    expect(screen.queryByRole('link', { name: /add booking/i })).not.toBeInTheDocument();
  });

  it('opens detail and checks in', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('ada@example.com'));
    expect(await screen.findByText('Check in')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Check in' }));
    await waitFor(() => {
      expect(api.checkInBooking).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
      );
    });
  });

  it('cancels with a reason', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('ada@example.com'));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await userEvent.type(
      screen.getByPlaceholderText(/why is this booking/i),
      'Water outage',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Cancel booking' }),
    );
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        'Water outage',
      );
    });
  });
});
