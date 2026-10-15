import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as businessApi from '@/features/settings/api/business-settings-api';
import { bookingSettings } from '@/features/settings/test-fixtures';
import type { UnitListItem } from '@/features/units/utils/unit-filters';
import * as mediaApi from '@/features/unit-media/api/unit-media-api';
import { mediaItem } from '@/features/unit-media/test-fixtures';
import { UnitDetailDrawer } from './unit-detail-drawer';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));
jest.mock('@/features/unit-media/api/unit-media-api');
jest.mock('@/features/settings/api/business-settings-api');

const api = jest.mocked(mediaApi);
const business = jest.mocked(businessApi);

const unit: UnitListItem = {
  id: 'unit-1',
  property_id: 'prop-1',
  linked_property_name: 'Azure Lekki',
  code: 'A',
  name: 'Charming 1bedroom',
  status: 'active',
  bookable: true,
  floor: '3',
  capacity: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  base_rate: 95000,
  cleaning_fee: 15000,
  weekly_discount_percent: 10,
  monthly_discount_percent: 20,
  min_nights: null,
  max_nights: null,
  facility_ids: [],
  amenities: [],
  summary: null,
  notes: null,
  picture: 'https://cdn.test/cover.jpg',
  city: 'Lekki',
  currency: 'NGN',
  created_at: '2026-10-01T00:00:00.000Z',
  updated_at: '2026-10-01T00:00:00.000Z',
  property_name: 'Azure Lekki',
  property_city: 'Lekki',
  property_currency: 'NGN',
  property_amenities: [],
};

beforeEach(() => {
  push.mockReset();
  api.fetchUnitMedia.mockResolvedValue([
    mediaItem({ id: 'm1' }),
    mediaItem({ id: 'm2', thumbnailUrl: 'https://cdn.test/t2.jpg' }),
  ]);
  business.fetchBookingSettings.mockResolvedValue(bookingSettings({ minNights: 1, maxNights: null }));
});

/** The value shown on a detail card, found by its label. */
const detailValue = (label: string) => screen.getByText(label).nextElementSibling;

describe('UnitDetailDrawer gallery strip', () => {

  it('shows the first thumbs and links to the gallery tab', async () => {
    const queryClient = createTestQueryClient();
    queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: null });
    renderWithProviders(<UnitDetailDrawer unit={unit} />, queryClient);

    await waitFor(() => {
      expect(screen.getAllByAltText('Bright living room').length).toBeGreaterThan(0);
    });
    await userEvent.click(screen.getByRole('button', { name: /Manage gallery/i }));
    expect(push).toHaveBeenCalledWith('/units/unit-1/edit?tab=gallery');
  });
});

describe('UnitDetailDrawer stay lengths', () => {
  it('shows the business default a unit follows', async () => {
    renderWithProviders(<UnitDetailDrawer unit={unit} />);
    expect(await screen.findByText('Business default (1 night)')).toBeInTheDocument();
    expect(detailValue('Minimum nights')).toHaveTextContent('Business default (1 night)');
    expect(detailValue('Maximum nights')).toHaveTextContent('Business default (no limit)');
  });

  it("shows the unit's own stay lengths", async () => {
    business.fetchBookingSettings.mockResolvedValue(bookingSettings({ minNights: 2, maxNights: 30 }));
    renderWithProviders(<UnitDetailDrawer unit={{ ...unit, min_nights: 1, max_nights: 14 }} />);
    await waitFor(() => expect(business.fetchBookingSettings).toHaveBeenCalled());
    expect(detailValue('Minimum nights')).toHaveTextContent('1 night');
    expect(detailValue('Maximum nights')).toHaveTextContent('14 nights');
    expect(screen.queryByText(/Business default/)).not.toBeInTheDocument();
  });

  it('says Business default when the business settings cannot load', async () => {
    business.fetchBookingSettings.mockRejectedValue(
      new ApiClientError('Server error', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderWithProviders(<UnitDetailDrawer unit={{ ...unit, min_nights: 3 }} />);
    await waitFor(() => expect(business.fetchBookingSettings).toHaveBeenCalled());
    expect(detailValue('Minimum nights')).toHaveTextContent('3 nights');
    expect(detailValue('Maximum nights')).toHaveTextContent(/^Business default$/);
  });
});
