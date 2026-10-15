import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as propertiesApi from '@/features/properties/api/properties-service';
import * as businessApi from '@/features/settings/api/business-settings-api';
import { bookingSettings } from '@/features/settings/test-fixtures';
import * as facilitiesApi from '@/features/units/api/facilities-api';
import * as unitsApi from '@/features/units/api/units-service';
import { mockProperties, mockUnits } from '@/mocks/data';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import { UnitFormPage } from './unit-form-page';

const push = jest.fn();
let search = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: jest.fn() }),
  useSearchParams: () => search,
}));
jest.mock('@/features/properties/api/properties-service');
jest.mock('@/features/settings/api/business-settings-api');
jest.mock('@/features/units/api/facilities-api');
jest.mock('@/features/units/api/units-service');

const properties = jest.mocked(propertiesApi);
const business = jest.mocked(businessApi);
const facilities = jest.mocked(facilitiesApi);
const units = jest.mocked(unitsApi);

const unit = { ...mockUnits[0], min_nights: 3, max_nights: null };

/** Opens the unit's Pricing tab, where the stay lengths are edited. */
function renderPricingTab() {
  search = new URLSearchParams({ tab: 'pricing' });
  return renderWithProviders(<UnitFormPage mode="edit" id={unit.id} />);
}

const saveButton = () => screen.getAllByRole('button', { name: 'Save changes' })[0];

beforeEach(() => {
  jest.resetAllMocks();
  search = new URLSearchParams();
  properties.fetchProperties.mockResolvedValue(mockProperties);
  facilities.fetchFacilities.mockResolvedValue([]);
  business.fetchBookingSettings.mockResolvedValue(bookingSettings({ minNights: 1, maxNights: null }));
  units.fetchUnit.mockResolvedValue(unit);
  units.updateUnit.mockImplementation(async () => unit);
});

describe('UnitFormPage length of stay', () => {
  it('shows the business defaults as placeholders', async () => {
    renderWithProviders(<UnitFormPage mode="create" />);
    const minNights = await screen.findByLabelText('Minimum nights');
    expect(minNights).toHaveValue(null);
    await waitFor(() => expect(minNights).toHaveAttribute('placeholder', 'Business default · 1 night'));
    expect(screen.getByLabelText('Maximum nights')).toHaveAttribute('placeholder', 'Business default · no limit');
  });

  it('shows a business maximum in the placeholder', async () => {
    business.fetchBookingSettings.mockResolvedValue(bookingSettings({ minNights: 3, maxNights: 30 }));
    renderWithProviders(<UnitFormPage mode="create" />);
    const maxNights = await screen.findByLabelText('Maximum nights');
    await waitFor(() => expect(maxNights).toHaveAttribute('placeholder', 'Business default · 30 nights'));
    expect(screen.getByLabelText('Minimum nights')).toHaveAttribute('placeholder', 'Business default · 3 nights');
  });

  it('says Business default while the business settings load', async () => {
    business.fetchBookingSettings.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<UnitFormPage mode="create" />);
    expect(await screen.findByLabelText('Minimum nights')).toHaveAttribute('placeholder', 'Business default');
    expect(screen.getByLabelText('Maximum nights')).toHaveAttribute('placeholder', 'Business default');
  });

  it("loads the unit's own values and saves changes", async () => {
    renderPricingTab();
    const minNights = await screen.findByLabelText('Minimum nights');
    expect(minNights).toHaveValue(3);
    expect(screen.getByLabelText('Maximum nights')).toHaveValue(null);

    await userEvent.clear(minNights);
    await userEvent.type(screen.getByLabelText('Maximum nights'), '14');
    await userEvent.click(saveButton());

    await waitFor(() =>
      expect(units.updateUnit).toHaveBeenCalledWith(
        unit.id,
        expect.objectContaining({ min_nights: '', max_nights: 14 }),
      ),
    );
  });

  it('rejects a maximum below the minimum and does not save', async () => {
    renderPricingTab();
    await userEvent.type(await screen.findByLabelText('Maximum nights'), '2');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Maximum nights must be at least the minimum nights')).toBeInTheDocument();
    expect(units.updateUnit).not.toHaveBeenCalled();
  });

  it('rejects stay lengths outside 1 to 366', async () => {
    renderPricingTab();
    const minNights = await screen.findByLabelText('Minimum nights');
    await userEvent.clear(minNights);
    await userEvent.type(minNights, '400');
    await userEvent.click(saveButton());
    expect(await screen.findByText('Minimum nights must be a whole number from 1 to 366')).toBeInTheDocument();
    expect(units.updateUnit).not.toHaveBeenCalled();
  });
});
