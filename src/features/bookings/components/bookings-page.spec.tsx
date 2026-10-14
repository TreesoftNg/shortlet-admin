import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import {
  createTestQueryClient,
  renderWithProviders,
} from '@/test-utils/render-with-providers';
import * as bookingsApi from '../api/bookings-service';
import {
  adminBooking,
  bookingListItem,
  paymentView,
  refundView,
} from '../test-fixtures';
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

  const openCancel = async (permissions?: string[]) => {
    renderAs(permissions);
    await userEvent.click(await screen.findByText('ada@example.com'));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await userEvent.type(
      screen.getByPlaceholderText(/why is this booking/i),
      'Water outage',
    );
  };

  it('cancels and refunds the whole stay and deposit by default', async () => {
    await openCancel();
    expect(screen.getByLabelText('Refund the stay')).toHaveValue(250000);
    expect(screen.getByLabelText(/return the deposit/i)).toBeChecked();
    expect(
      screen.getByText(/guest gets back ₦320,000 of ₦320,000 paid/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        {
          reason: 'Water outage',
          stayRefund: 250000,
          refundReason: 'guest_cancellation',
          returnDeposit: true,
        },
      );
    });
  });

  it('refunds part of the stay with a chosen reason and keeps the deposit', async () => {
    await openCancel();
    const stay = screen.getByLabelText('Refund the stay');
    await userEvent.clear(stay);
    await userEvent.type(stay, '100000');
    await userEvent.selectOptions(
      screen.getByLabelText('Refund reason'),
      'host_cancellation',
    );
    await userEvent.click(screen.getByLabelText(/return the deposit/i));
    expect(
      screen.getByText(/guest gets back ₦100,000 of ₦320,000 paid/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        {
          reason: 'Water outage',
          stayRefund: 100000,
          refundReason: 'host_cancellation',
        },
      );
    });
  });

  it('refuses more than the stay left and needs a reason', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('ada@example.com'));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    const stay = screen.getByLabelText('Refund the stay');
    await userEvent.clear(stay);
    await userEvent.type(stay, '250001');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));

    expect(
      await screen.findByText('Say why this booking is being cancelled.'),
    ).toBeInTheDocument();
    expect(screen.getByText(/enter an amount from ₦0 to ₦250,000/i)).toBeInTheDocument();
    expect(api.cancelBooking).not.toHaveBeenCalled();
  });

  it('keeps the deposit by default for a checked-in guest', async () => {
    api.fetchBooking.mockResolvedValue(adminBooking({ status: 'checked_in' }));
    await openCancel();
    expect(screen.getByLabelText(/return the deposit/i)).not.toBeChecked();
    expect(screen.getByText(/inspect the apartment first/i)).toBeInTheDocument();
  });

  it('only cancels for someone without refund access', async () => {
    await openCancel(['booking.read', 'booking.update', 'booking.cancel']);
    expect(screen.queryByLabelText('Refund the stay')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/return the deposit/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/someone with refund access can refund this/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith(
        '11111111-1111-1111-1111-111111111111',
        { reason: 'Water outage' },
      );
    });
  });

  it('warns when a refund did not go through', async () => {
    api.cancelBooking.mockResolvedValue(
      adminBooking({
        status: 'cancelled',
        cancellationReason: 'Water outage',
        refunds: [
          refundView({
            id: 'refund-failed',
            kind: 'stay',
            status: 'failed',
            failureReason: 'Flutterwave declined the refund',
          }),
        ],
      }),
    );
    await openCancel();
    await userEvent.click(screen.getByRole('button', { name: 'Cancel booking' }));

    expect(
      await screen.findByText('A refund did not go through'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/stay refund: flutterwave declined the refund/i),
    ).toBeInTheDocument();
  });

  it('shows who cancelled and what was returned', async () => {
    api.fetchBooking.mockResolvedValue(
      adminBooking({
        status: 'cancelled',
        cancellationReason: 'distance',
        cancelledBy: 'staff',
        cancelledByUser: { id: 'u9', name: 'Temitope Aladesiun', role: 'owner' },
        amountRefunded: '250000.00',
        stayRefunded: '250000.00',
        payments: [
          paymentView({
            amount: '320000.00',
            amountRefunded: '250000.00',
            status: 'partially_refunded',
          }),
        ],
      }),
    );
    renderAs();
    await userEvent.click(await screen.findByText('ada@example.com'));

    expect(await screen.findByText('Owner · Temitope Aladesiun')).toBeInTheDocument();
    expect(screen.getByText('Partly refunded')).toBeInTheDocument();
    expect(screen.getByText('₦250,000 of ₦320,000 refunded')).toBeInTheDocument();
    expect(screen.getByText('Stay ₦250,000 · Deposit ₦0')).toBeInTheDocument();
    expect(screen.getByText('Not returned yet')).toBeInTheDocument();
  });
});
