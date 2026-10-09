import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import * as calendarSyncApi from '@/features/calendar-sync/api/calendar-sync-api';
import * as staffBookingsApi from '@/features/bookings/live/staff-bookings-api';
import type { AdminBooking } from '@/features/bookings/live/types';
import { queryKeys } from '@/shared/api/query-keys';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as availabilityApi from '../api/availability-service';
import type { AvailabilityCalendar, CalendarEvent } from '../types';
import { AvailabilityPage } from './availability-page';

jest.mock('../api/availability-service');
jest.mock('@/features/calendar-sync/api/calendar-sync-api');
jest.mock('@/features/bookings/live/staff-bookings-api');
jest.mock('@/features/properties/hooks/use-properties', () => ({
  useProperties: () => ({ data: [{ id: 'p1', name: 'Azure Lekki' }] }),
}));
const replace = jest.fn();
let search = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: jest.fn() }),
  useSearchParams: () => search,
}));

const api = jest.mocked(availabilityApi);
const syncApi = jest.mocked(calendarSyncApi);
const bookingsApi = jest.mocked(staffBookingsApi);

const TODAY = '2026-10-06';
const ALL = ['availability.read', 'availability.manage', 'booking.read', 'booking.create', 'integration.manage'];

const event = (overrides: Partial<CalendarEvent>): CalendarEvent => ({
  id: 'e',
  unitId: 'u1',
  kind: 'confirmed',
  startDate: TODAY,
  endDate: '2026-10-08',
  conflict: false,
  label: 'Guest',
  initials: null,
  bookingId: null,
  reference: null,
  externalEventId: null,
  reservationCode: null,
  channel: null,
  blockId: null,
  blockReason: null,
  blockNote: null,
  ...overrides,
});

const rates = (amount: string | null) =>
  Object.fromEntries(
    Array.from({ length: 14 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 9, 6 + index)).toISOString().slice(0, 10);
      return [date, amount];
    }),
  );

const calendar: AvailabilityCalendar = {
  from: TODAY,
  to: '2026-10-20',
  today: TODAY,
  currency: 'NGN',
  units: [
    {
      id: 'u1',
      name: 'Unit A',
      publicName: null,
      code: 'A',
      subtitle: '2 bed · 3rd floor',
      propertyId: 'p1',
      propertyName: 'Azure Lekki',
      status: 'active',
      openForBooking: true,
      minNights: 1,
      maxNights: null,
      rates: rates('85000.00'),
    },
    {
      id: 'u2',
      name: 'Studio 1',
      publicName: null,
      code: null,
      subtitle: 'Studio',
      propertyId: null,
      propertyName: null,
      status: 'maintenance',
      openForBooking: false,
      minNights: 1,
      maxNights: null,
      rates: rates(null),
    },
  ],
  events: [
    event({ id: 'booking:b1', bookingId: 'b1', label: 'Sarah Jones', initials: 'SJ', reference: 'K7QH2MXP4D' }),
    event({
      id: 'external:e1',
      kind: 'external',
      startDate: '2026-10-07',
      endDate: '2026-10-09',
      conflict: true,
      label: 'Femi · via Hospitable',
      reservationCode: 'HMX1',
    }),
    event({
      id: 'block:k1',
      unitId: 'u2',
      kind: 'blocked',
      startDate: '2026-10-10',
      endDate: '2026-10-12',
      label: 'Maintenance',
      blockId: 'k1',
      blockReason: 'maintenance',
    }),
  ],
};

const booking: AdminBooking = {
  id: 'b1',
  reference: 'K7QH2MXP4D',
  status: 'pending_payment',
  source: 'staff',
  unit: { id: 'u1', name: 'Unit A', publicName: null, propertyName: 'Azure Lekki' },
  checkIn: TODAY,
  checkOut: '2026-10-08',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  nights: 2,
  guests: { adults: 2, children: 0, infants: 0 },
  guest: { firstName: 'Sarah', lastName: 'Jones', email: 'sarah@example.com', phone: '+2348030000000' },
  specialRequests: null,
  currency: 'NGN',
  price: {
    currency: 'NGN',
    checkIn: TODAY,
    checkOut: '2026-10-08',
    nights: 2,
    nightly: [],
    nightsSubtotal: '170000.00',
    discount: null,
    cleaningFee: '0.00',
    serviceFee: { percent: '0', amount: '0.00' },
    tax: { name: 'VAT', percent: '0', amount: '0.00' },
    total: '170000.00',
  },
  stayTotal: '170000.00',
  deposit: { amount: '85000.00', nights: 1, status: 'pending', refunded: '0.00', dueAt: null },
  totalAmount: '255000.00',
  amountPaid: '0.00',
  amountRefunded: '0.00',
  holdExpiresAt: '2026-10-07T10:00:00.000Z',
  cancellationReason: null,
  payments: [
    {
      id: 'p1',
      provider: 'flutterwave',
      reference: 'ref-1',
      providerTransactionId: null,
      amount: '255000.00',
      currency: 'NGN',
      status: 'initialized',
      paymentMethod: null,
      offlineReference: null,
      checkoutUrl: 'https://checkout.test/p1',
      paidAt: null,
      failureReason: null,
      createdAt: '2026-10-06T10:00:00.000Z',
    },
  ],
};

function renderAs(permissions = ALL) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'owner@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<AvailabilityPage />, queryClient);
}

const cell = (unitName: string, night: string) => screen.getByRole('gridcell', { name: `${unitName}, ${night}` });

beforeEach(() => {
  jest.resetAllMocks();
  search = new URLSearchParams();
  jest.useFakeTimers({ doNotFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'queueMicrotask'] });
  jest.setSystemTime(new Date('2026-10-06T09:00:00Z'));
  api.fetchAvailabilityCalendar.mockResolvedValue(calendar);
  syncApi.fetchCalendarUnits.mockResolvedValue([]);
});

afterEach(() => jest.useRealTimers());

describe('AvailabilityPage', () => {
  it("loads the live calendar for today's window and shows each unit's rates", async () => {
    renderAs();

    expect(await screen.findByText('Unit A')).toBeInTheDocument();
    expect(api.fetchAvailabilityCalendar).toHaveBeenCalledWith({ from: TODAY, to: '2026-10-20', propertyId: 'all' });
    expect(screen.getByRole('grid')).toHaveTextContent('Azure Lekki');
    expect(screen.getByText('No property')).toBeInTheDocument();
    const studio = within(screen.getByTestId('unit-row-u2')).getByRole('rowheader');
    expect(within(studio).getByText('Maintenance')).toBeInTheDocument();
    expect(within(studio).getByText('Studio · Not on website')).toBeInTheDocument();
    expect(within(cell('Unit A', '2026-10-10')).getByText('₦85k')).toBeInTheDocument();
    expect(within(cell('Studio 1', '2026-10-15')).getByText('—')).toBeInTheDocument();
    // Nights covered by a stay show the bar, not the price.
    expect(within(cell('Unit A', TODAY)).queryByText('₦85k')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Femi · via Hospitable — overlaps another stay/ })).toBeInTheDocument();
  });

  it('filters by a real property id and moves by the chosen range', async () => {
    renderAs();
    await screen.findByText('Unit A');

    fireEvent.change(screen.getByRole('combobox', { name: 'Property' }), { target: { value: 'p1' } });
    await waitFor(() =>
      expect(api.fetchAvailabilityCalendar).toHaveBeenLastCalledWith({ from: TODAY, to: '2026-10-20', propertyId: 'p1' }),
    );
    expect(replace).toHaveBeenCalledWith('/availability?propertyId=p1', { scroll: false });

    await userEvent.click(screen.getByRole('button', { name: 'Week' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next range' }));
    await waitFor(() =>
      expect(api.fetchAvailabilityCalendar).toHaveBeenLastCalledWith({
        from: '2026-10-13',
        to: '2026-10-20',
        propertyId: 'p1',
      }),
    );
  });

  it('opens a booking with its payment link and records a payment received', async () => {
    bookingsApi.fetchAdminBooking.mockResolvedValue(booking);
    bookingsApi.recordOfflinePayment.mockResolvedValue({ ...booking, status: 'confirmed' });
    renderAs();

    await userEvent.click(await screen.findByRole('button', { name: 'Sarah Jones' }));

    expect(await screen.findByText('Booking K7QH2MXP4D')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy payment link' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Record payment received' }));
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Payment method' }), 'cash');
    await userEvent.type(screen.getByRole('textbox', { name: 'Payment reference' }), 'Front desk');
    await userEvent.click(screen.getByRole('button', { name: 'Confirm payment' }));

    await waitFor(() =>
      expect(bookingsApi.recordOfflinePayment).toHaveBeenCalledWith('b1', { method: 'cash', reference: 'Front desk' }),
    );
  });

  it('removes a block after confirming', async () => {
    syncApi.deleteBlock.mockResolvedValue(undefined);
    renderAs();

    await userEvent.click(await screen.findByRole('button', { name: 'Maintenance' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Remove block' }));
    await userEvent.click(screen.getByRole('button', { name: 'Yes, remove block' }));

    await waitFor(() => expect(syncApi.deleteBlock).toHaveBeenCalledWith('u2', 'k1'));
  });

  it('blocks nights dragged across on a unit row', async () => {
    syncApi.createBlock.mockResolvedValue({} as never);
    renderAs();
    await screen.findByText('Unit A');

    fireEvent.mouseDown(cell('Unit A', '2026-10-12'));
    fireEvent.mouseEnter(cell('Unit A', '2026-10-14'));
    fireEvent.mouseUp(window);

    const bar = screen.getByRole('status');
    expect(within(bar).getByText(/Unit A: .*\(3 nights\)/)).toBeInTheDocument();
    await userEvent.click(within(bar).getByRole('button', { name: 'Block these nights' }));
    expect(screen.getByLabelText('First night')).toHaveValue('2026-10-12');
    expect(screen.getByLabelText('Checkout day')).toHaveValue('2026-10-15');
    await userEvent.click(screen.getByRole('button', { name: 'Block nights' }));

    await waitFor(() =>
      expect(syncApi.createBlock).toHaveBeenCalledWith('u1', {
        startDate: '2026-10-12',
        endDate: '2026-10-15',
        reason: 'maintenance',
      }),
    );
  });

  it('does not let a selection cross a taken night or start in the past', async () => {
    renderAs();
    await screen.findByText('Unit A');

    fireEvent.mouseDown(cell('Unit A', '2026-10-09'));
    fireEvent.mouseEnter(cell('Unit A', '2026-10-06'));
    fireEvent.mouseUp(window);
    expect(within(screen.getByRole('status')).getByText(/\(1 night\)/)).toBeInTheDocument();

    fireEvent.mouseDown(cell('Unit A', TODAY)); // taken by Sarah's stay
    expect(within(screen.getByRole('status')).getByText(/\(1 night\)/)).toBeInTheDocument();
  });

  it('hides actions from staff without the permissions', async () => {
    renderAs(['availability.read', 'booking.read']);
    await screen.findByText('Unit A');

    expect(screen.queryByRole('button', { name: 'Block dates' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'New booking' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sync Hospitable' })).not.toBeInTheDocument();
    fireEvent.mouseDown(cell('Unit A', '2026-10-12'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('syncs every unit connected to Hospitable', async () => {
    syncApi.fetchCalendarUnits.mockResolvedValue([
      { unitId: 'u1', feed: { status: 'active' } },
      { unitId: 'u2', feed: null },
    ] as never);
    syncApi.syncImportFeed.mockResolvedValue({} as never);
    renderAs();
    await screen.findByText('Unit A');
    await waitFor(() => expect(syncApi.fetchCalendarUnits).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'Sync Hospitable' }));

    await waitFor(() => expect(syncApi.syncImportFeed).toHaveBeenCalledWith('u1'));
    expect(syncApi.syncImportFeed).toHaveBeenCalledTimes(1);
  });
});
