import { screen } from '@testing-library/react';
import * as businessApi from '@/features/settings/api/business-settings-api';
import { businessProfile } from '@/features/settings/test-fixtures';
import * as facilitiesApi from '@/features/units/api/facilities-api';
import { ApiClientError } from '@/shared/api/types';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import { PropertyFormPage } from './property-form-page';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));
jest.mock('@/features/settings/api/business-settings-api');
jest.mock('@/features/units/api/facilities-api');

const business = jest.mocked(businessApi);
const facilities = jest.mocked(facilitiesApi);

beforeEach(() => {
  jest.resetAllMocks();
  facilities.fetchFacilities.mockResolvedValue([]);
});

describe('PropertyFormPage (create)', () => {
  it('starts a new property with the business defaults', async () => {
    business.fetchBusinessProfile.mockResolvedValue(
      businessProfile({
        defaultCheckInTime: '16:00',
        defaultCheckOutTime: '10:00',
        defaultTimezone: 'Africa/Nairobi',
        defaultCurrency: 'KES',
      }),
    );
    renderWithProviders(<PropertyFormPage mode="create" />);

    expect(await screen.findByLabelText('Check-in time')).toHaveValue('16:00');
    expect(screen.getByLabelText('Checkout time')).toHaveValue('10:00');
    expect(screen.getByLabelText('Timezone')).toHaveValue('Africa/Nairobi');
    expect(screen.getByLabelText('Currency')).toHaveValue('KES');
  });

  it('keeps a saved default that is not in the picker list', async () => {
    business.fetchBusinessProfile.mockResolvedValue(businessProfile({ defaultTimezone: 'Africa/Kigali' }));
    renderWithProviders(<PropertyFormPage mode="create" />);
    expect(await screen.findByLabelText('Timezone')).toHaveValue('Africa/Kigali');
  });

  it('falls back to the built-in defaults when the business profile cannot load', async () => {
    business.fetchBusinessProfile.mockRejectedValue(
      new ApiClientError('Server error', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderWithProviders(<PropertyFormPage mode="create" />);
    expect(await screen.findByLabelText('Check-in time')).toHaveValue('15:00');
    expect(screen.getByLabelText('Timezone')).toHaveValue('Africa/Lagos');
    expect(screen.getByLabelText('Currency')).toHaveValue('NGN');
  });
});
