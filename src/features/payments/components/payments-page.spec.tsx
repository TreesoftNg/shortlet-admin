import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import {
  createTestQueryClient,
  renderWithProviders,
} from '@/test-utils/render-with-providers';
import * as paymentsApi from '../api/payments-service';
import { paymentDetail, paymentListItem } from '../test-fixtures';
import { PaymentsPage } from './payments-page';

jest.mock('../api/payments-service');
jest.mock('@/features/bookings/api/bookings-service', () => ({
  fetchBooking: jest.fn(),
}));

const api = jest.mocked(paymentsApi);

function renderAs(permissions = ['payment.read', 'payment.refund']) {
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
  return renderWithProviders(<PaymentsPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchPayments.mockResolvedValue({
    items: [paymentListItem()],
    page: 1,
    limit: 20,
    total: 1,
    totalPages: 1,
  });
  api.fetchPayment.mockResolvedValue(paymentDetail());
  api.verifyPayment.mockResolvedValue(paymentDetail());
  api.createStayRefund.mockResolvedValue({
    id: '55555555-5555-5555-5555-555555555555',
    paymentId: '44444444-4444-4444-4444-444444444444',
    bookingId: '11111111-1111-1111-1111-111111111111',
    kind: 'stay',
    amount: '50000.00',
    reason: 'guest_cancellation',
    note: null,
    status: 'completed',
    failureReason: null,
    requestedBy: { id: 'u1', name: 'Ada Okafor' },
    processedAt: '2026-10-02T09:00:00.000Z',
    createdAt: '2026-10-02T08:55:00.000Z',
  });
});

describe('PaymentsPage', () => {
  it('lists payments from the API', async () => {
    renderAs();
    expect(await screen.findByText('Ada Okafor')).toBeInTheDocument();
    expect(screen.getByText('Azure Lekki Studio')).toBeInTheDocument();
    expect(screen.queryByText('pay_SM_ABC123')).not.toBeInTheDocument();
    expect(api.fetchPayments).toHaveBeenCalled();
  });

  it('blocks access without payment.read', async () => {
    renderAs([]);
    expect(await screen.findByText('No access')).toBeInTheDocument();
    expect(api.fetchPayments).not.toHaveBeenCalled();
  });

  it('verifies a payment with Flutterwave', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('Ada Okafor'));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Check with Flutterwave' }),
    );
    await waitFor(() => {
      expect(api.verifyPayment).toHaveBeenCalledWith(
        '44444444-4444-4444-4444-444444444444',
      );
    });
  });

  it('refunds a stay from the payment drawer', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('Ada Okafor'));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Refund stay' }),
    );
    expect(await screen.findByText(/Up to/i)).toBeInTheDocument();
    const amount = screen.getByDisplayValue('250000');
    await userEvent.clear(amount);
    await userEvent.type(amount, '50000');
    await userEvent.click(screen.getByRole('button', { name: 'Refund stay' }));
    await waitFor(() => {
      expect(api.createStayRefund).toHaveBeenCalledWith(
        '44444444-4444-4444-4444-444444444444',
        expect.objectContaining({
          amount: 50000,
          reason: 'guest_cancellation',
        }),
      );
    });
  });
});
