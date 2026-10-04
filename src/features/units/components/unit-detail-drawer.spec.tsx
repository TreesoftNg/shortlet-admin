import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryKeys } from '@/shared/api/query-keys';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import type { UnitListItem } from '@/features/units/utils/unit-filters';
import * as mediaApi from '@/features/unit-media/api/unit-media-api';
import { mediaItem } from '@/features/unit-media/test-fixtures';
import { UnitDetailDrawer } from './unit-detail-drawer';

const push = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));
jest.mock('@/features/unit-media/api/unit-media-api');

const api = jest.mocked(mediaApi);

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

describe('UnitDetailDrawer gallery strip', () => {
  beforeEach(() => {
    push.mockReset();
    api.fetchUnitMedia.mockResolvedValue([
      mediaItem({ id: 'm1' }),
      mediaItem({ id: 'm2', thumbnailUrl: 'https://cdn.test/t2.jpg' }),
    ]);
  });

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
