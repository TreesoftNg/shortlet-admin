import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CalendarUnitRow } from '@/features/availability/types';
import { ApiClientError } from '@/shared/api/types';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import * as staffBookingsApi from './staff-bookings-api';
import { StaffBookingForm } from './staff-booking-form';
import type { StaffQuote } from './types';

jest.mock('./staff-bookings-api');
const api = jest.mocked(staffBookingsApi);

const unit: CalendarUnitRow = {
  id: 'u1',
  name: 'Unit A',
  publicName: null,
  code: 'A',
  subtitle: '2 bed',
  propertyId: 'p1',
  propertyName: 'Azure Lekki',
  status: 'active',
  openForBooking: true,
  minNights: 1,
  maxNights: null,
  rates: {},
};

const quote = (overrides: Partial<StaffQuote['price']> = {}): StaffQuote => ({
  unitId: 'u1',
  checkIn: '2026-10-12',
  checkOut: '2026-10-14',
  nights: 2,
  currency: 'NGN',
  price: {
    currency: 'NGN',
    checkIn: '2026-10-12',
    checkOut: '2026-10-14',
    nights: 2,
    nightly: [],
    nightsSubtotal: '100000.00',
    discount: null,
    cleaningFee: '10000.00',
    serviceFee: { percent: '0', amount: '0.00' },
    tax: { name: 'VAT', percent: '7.5', amount: '8250.00' },
    total: '118250.00',
    ...overrides,
  },
  deposit: { nights: 1, nightlyRate: '50000.00', amount: '50000.00' },
  totalDueNow: '168250.00',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  houseRules: null,
});

const renderForm = () =>
  renderWithProviders(
    <StaffBookingForm
      isOpen
      onClose={jest.fn()}
      units={[unit]}
      today="2026-10-06"
      initial={{ unitId: 'u1', startDate: '2026-10-12', endDate: '2026-10-14' }}
    />,
  );

async function fillGuest() {
  await userEvent.type(screen.getByRole('textbox', { name: 'First name' }), 'Kemi');
  await userEvent.type(screen.getByRole('textbox', { name: 'Last name' }), 'Adebayo');
  await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'kemi@example.com');
  await userEvent.type(screen.getByRole('textbox', { name: 'Phone' }), '+2348030000001');
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchStaffQuote.mockResolvedValue(quote());
});

describe('StaffBookingForm', () => {
  it('shows the live price with the deposit for the picked nights', async () => {
    renderForm();

    const summary = await screen.findByTestId('staff-quote');
    expect(within(summary).getByText('₦168,250.00')).toBeInTheDocument();
    expect(within(summary).getByText('Refundable deposit')).toBeInTheDocument();
    expect(api.fetchStaffQuote).toHaveBeenCalledWith({
      unitId: 'u1',
      checkIn: '2026-10-12',
      checkOut: '2026-10-14',
      adults: 1,
      children: 0,
      infants: 0,
      discount: undefined,
    });
  });

  it('needs a reason for a discount, and previews it', async () => {
    renderForm();
    await screen.findByTestId('staff-quote');
    await fillGuest();
    api.fetchStaffQuote.mockResolvedValue(quote({ staffDiscount: { amount: '20000.00', reason: 'Staff discount' } }));

    await userEvent.type(screen.getByRole('spinbutton', { name: 'Discount amount' }), '20000');
    await waitFor(() => expect(api.fetchStaffQuote).toHaveBeenLastCalledWith(expect.objectContaining({ discount: 20000 })));
    expect(await screen.findByText('Staff discount')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));
    expect(await screen.findByText('Say why you are giving a discount.')).toBeInTheDocument();
    expect(api.createStaffBooking).not.toHaveBeenCalled();
  });

  it('records a payment received and sends the booking', async () => {
    api.createStaffBooking.mockResolvedValue({ booking: { reference: 'K7QH2MXP4D' } as never, checkout: null });
    renderForm();
    await screen.findByTestId('staff-quote');
    await fillGuest();
    await userEvent.type(screen.getByRole('textbox', { name: 'Payment reference' }), 'TRF-1');

    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));

    await waitFor(() =>
      expect(api.createStaffBooking).toHaveBeenCalledWith({
        unitId: 'u1',
        checkIn: '2026-10-12',
        checkOut: '2026-10-14',
        adults: 1,
        children: 0,
        infants: 0,
        guest: { firstName: 'Kemi', lastName: 'Adebayo', email: 'kemi@example.com', phone: '+2348030000001' },
        specialRequests: null,
        payment: { mode: 'offline', method: 'bank_transfer', reference: 'TRF-1' },
      }),
    );
  });

  it('emails a payment link and shows it to copy', async () => {
    api.createStaffBooking.mockResolvedValue({
      booking: { reference: 'K7QH2MXP4D' } as never,
      checkout: {
        paymentId: 'p1',
        reference: 'ref-1',
        checkoutUrl: 'https://checkout.test/p1',
        expiresAt: '2026-10-07T10:00:00.000Z',
      },
    });
    renderForm();
    await screen.findByTestId('staff-quote');
    await fillGuest();

    await userEvent.click(screen.getByRole('radio', { name: 'Email the guest a payment link' }));
    await userEvent.click(screen.getByRole('button', { name: 'Send payment link' }));

    expect(await screen.findByText('Payment link sent')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Payment link' })).toHaveValue('https://checkout.test/p1');
    expect(api.createStaffBooking.mock.calls[0][0].payment).toEqual({ mode: 'link' });
  });

  it('explains when the nights were just taken', async () => {
    api.createStaffBooking.mockRejectedValue(
      new ApiClientError('Those dates are no longer available.', { code: 'BOOKING_UNAVAILABLE', status: 409 }),
    );
    renderForm();
    await screen.findByTestId('staff-quote');
    await fillGuest();

    await userEvent.click(screen.getByRole('button', { name: 'Confirm booking' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Those nights are taken. Pick other dates.');
  });
});
