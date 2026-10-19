import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { manyUnits, reportsData, twoPropertyReports, unitPerformance, withUnits } from '@/features/dashboard/test-fixtures';
import { queryKeys } from '@/shared/api/query-keys';
import { exportRowsAsCsv, rowsToCsv } from '@/shared/utils/export-csv';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as reportsApi from '../api/reports-service';
import { ReportsPage } from './reports-page';

jest.mock('../api/reports-service');
jest.mock('@/shared/utils/export-csv', () => ({
  ...jest.requireActual('@/shared/utils/export-csv'),
  exportRowsAsCsv: jest.fn(),
}));
const api = jest.mocked(reportsApi);
const exportCsv = jest.mocked(exportRowsAsCsv);

function renderAs(permissions = ['reports.view']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'manager', name: 'Manager' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<ReportsPage />, queryClient);
}

const findUnitTable = () => screen.findByRole('table', { name: 'Unit performance' });
const searchBox = () => screen.getByRole('textbox', { name: 'Search units' });

/** A table's rows without the header and totals rows. */
function bodyRows(table: HTMLElement) {
  return within(table).getAllByRole('row').slice(1, -1);
}

function cellTexts(row: HTMLElement) {
  return within(row).getAllByRole('cell').map((cell) => cell.textContent);
}

function totalsRow(table: HTMLElement) {
  return cellTexts(within(table).getAllByRole('row').at(-1)!);
}

/** `rows` show exactly `labels`, in order. */
function expectLabels(rows: HTMLElement[], labels: string[]) {
  expect(rows).toHaveLength(labels.length);
  labels.forEach((label, index) => expect(within(rows[index]).getByText(label)).toBeInTheDocument());
}

function lowestOccupancyRows() {
  return within(screen.getByRole('list', { name: 'Lowest occupancy' })).getAllByRole('listitem');
}

// Export buttons are hidden on small screens and jsdom applies no media queries, so they have no accessible name.
const clickExport = (label: string) => userEvent.click(screen.getByText(label));

/** Filename and CSV lines of the nth export. */
function exportedCsv(call = 0) {
  const [filename, rows, columns] = exportCsv.mock.calls[call];
  return { filename, lines: rowsToCsv(rows, columns).split('\n') };
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchReports.mockResolvedValue(reportsData());
});

afterEach(() => {
  jest.restoreAllMocks();
  window.location.hash = '';
});

describe('ReportsPage', () => {
  it('shows the finance summary for the period', async () => {
    renderAs();
    expect(await screen.findByText('Finance summary')).toBeInTheDocument();
    const row = (label: string) => screen.getByText(label).parentElement!.parentElement!;
    expect(row('Gross revenue')).toHaveTextContent('₦950,000');
    expect(row('Stay refunds')).toHaveTextContent('₦50,000');
    expect(row('Net revenue')).toHaveTextContent('₦900,000');
    expect(row('Pending refunds')).toHaveTextContent(
      'Waiting at the payment provider right now₦25,000',
    );
  });

  it('lists every unit with totals for the period', async () => {
    renderAs();
    const table = await findUnitTable();
    expectLabels(bodyRows(table), ['Garden Suite', 'Pool View Studio', 'Courtyard Loft', 'Penthouse']);
    expect(cellTexts(bodyRows(table)[0])).toEqual(['Garden SuiteGRA-01', '₦450,000', '3', '11', '36.7%', '₦75,000']);
    // Occupancy and nightly rate are the period's figures, not sums of the units.
    expect(totalsRow(table)).toEqual(['Total', '₦900,000', '7', '32', '27.6%', '₦81,818']);
    expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();
  });

  it('marks archived units and units with no open nights', async () => {
    api.fetchReports.mockResolvedValue(
      reportsData(
        withUnits([
          unitPerformance(),
          unitPerformance({ unitId: 'u9', unitName: 'Old Annex', unitCode: null, archived: true, occupancyPercent: null }),
        ]),
      ),
    );
    renderAs();
    const annex = bodyRows(await findUnitTable())[1];
    expect(within(annex).getByText('Archived')).toBeInTheDocument();
    expect(cellTexts(annex)[4]).toBe('—');
  });

  it('sorts by any column, toggling the direction', async () => {
    renderAs();
    const table = await findUnitTable();
    const header = (name: string) => within(table).getByRole('columnheader', { name });
    const sortBy = (name: string) => userEvent.click(within(table).getByRole('button', { name }));
    expect(header('Revenue')).toHaveAttribute('aria-sort', 'descending');
    expect(header('Unit')).toHaveAttribute('aria-sort', 'none');

    await sortBy('Unit');
    expect(header('Unit')).toHaveAttribute('aria-sort', 'ascending');
    expect(header('Revenue')).toHaveAttribute('aria-sort', 'none');
    expectLabels(bodyRows(table), ['Courtyard Loft', 'Garden Suite', 'Penthouse', 'Pool View Studio']);

    await sortBy('Unit');
    expect(header('Unit')).toHaveAttribute('aria-sort', 'descending');
    expectLabels(bodyRows(table), ['Pool View Studio', 'Penthouse', 'Garden Suite', 'Courtyard Loft']);

    await sortBy('Occupancy');
    expect(header('Occupancy')).toHaveAttribute('aria-sort', 'descending');
    await sortBy('Occupancy');
    expect(header('Occupancy')).toHaveAttribute('aria-sort', 'ascending');
    expectLabels(bodyRows(table), ['Penthouse', 'Courtyard Loft', 'Pool View Studio', 'Garden Suite']);
  });

  it('searches units by name or code and keeps totals for every unit', async () => {
    renderAs();
    const table = await findUnitTable();

    await userEvent.type(searchBox(), 'loft');
    expectLabels(bodyRows(table), ['Courtyard Loft']);
    expect(totalsRow(table)[1]).toBe('₦900,000');

    await userEvent.clear(searchBox());
    await userEvent.type(searchBox(), 'gra-04');
    expectLabels(bodyRows(table), ['Penthouse']);

    await userEvent.clear(searchBox());
    await userEvent.type(searchBox(), ' zzz ');
    expect(screen.getByText('No units match “zzz”.')).toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Unit performance' })).not.toBeInTheDocument();
  });

  it('pages through units 20 at a time, back to the first page on a new search or sort', async () => {
    api.fetchReports.mockResolvedValue(reportsData(withUnits(manyUnits(45))));
    renderAs();
    const table = await findUnitTable();
    expect(bodyRows(table)).toHaveLength(20);
    expect(screen.getByText('Showing 1–20 of 45')).toBeInTheDocument();
    // Totals cover all 45 units, not only this page.
    expect(totalsRow(table)[1]).toBe('₦51,750,000');

    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Showing 21–40 of 45')).toBeInTheDocument();
    expect(within(bodyRows(table)[0]).getByText('Unit 21')).toBeInTheDocument();

    await userEvent.type(searchBox(), 'Unit');
    expect(screen.getByText('Showing 1–20 of 45')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(bodyRows(table)).toHaveLength(5);
    await userEvent.click(within(table).getByRole('button', { name: 'Nights' }));
    expect(screen.getByText('Showing 1–20 of 45')).toBeInTheDocument();
    expect(within(bodyRows(table)[0]).getByText('Unit 45')).toBeInTheDocument();

    await userEvent.clear(searchBox());
    await userEvent.type(searchBox(), 'Unit 4');
    expect(bodyRows(table)).toHaveLength(7);
    expect(screen.queryByText(/^Showing/)).not.toBeInTheDocument();
  });

  it('scrolls to the unit table when opened from the dashboard link', async () => {
    window.location.hash = '#units';
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView');
    renderAs();
    await findUnitTable();
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView.mock.contexts[0]).toHaveAttribute('id', 'units');
  });

  it('does not scroll without the anchor', async () => {
    const scrollIntoView = jest.spyOn(Element.prototype, 'scrollIntoView');
    renderAs();
    await findUnitTable();
    expect(scrollIntoView).not.toHaveBeenCalled();
  });

  it('lists the units with the lowest occupancy, leaving out units with no open nights', async () => {
    api.fetchReports.mockResolvedValue(
      reportsData(withUnits([...manyUnits(6), unitPerformance({ unitId: 'u9', unitName: 'Closed Unit', occupancyPercent: null })])),
    );
    renderAs();
    await findUnitTable();
    const rows = lowestOccupancyRows();
    expectLabels(rows, ['Unit 1 (U-01)', 'Unit 2 (U-02)', 'Unit 3 (U-03)', 'Unit 4 (U-04)', 'Unit 5 (U-05)']);
    expect(rows[0]).toHaveTextContent('6.7%');
    expect(rows[0]).toHaveTextContent('2 of 30 nights');
    expect(screen.getAllByText('27.6%')).toHaveLength(3); // KPI card, overall in the side panel, totals row
  });

  it('exports every unit, not just the page on screen', async () => {
    api.fetchReports.mockResolvedValue(reportsData(withUnits(manyUnits(25))));
    renderAs();
    await findUnitTable();
    expect(screen.queryByText('Export properties')).not.toBeInTheDocument();
    await clickExport('Export');

    const { filename, lines } = exportedCsv();
    expect(filename).toBe('unit-performance-2026-09-10-to-2026-10-09');
    expect(lines).toHaveLength(26);
    expect(lines[0]).toBe('Unit,Code,Property,Revenue (NGN),Bookings,Nights,Occupancy %,Avg nightly rate (NGN),Archived');
    expect(lines[1]).toBe('Unit 1,U-01,Sunmade Ikeja GRA,1250000,1,2,6.7,40000,No');
    expect(lines[25]).toMatch(/^Unit 25,/);
  });

  it('exports a missing code, property or occupancy as a blank cell', async () => {
    api.fetchReports.mockResolvedValue(
      reportsData(
        withUnits([
          unitPerformance({ unitCode: null, propertyId: null, propertyName: null, occupancyPercent: null, archived: true }),
        ]),
      ),
    );
    renderAs();
    await findUnitTable();
    await clickExport('Export');
    expect(exportedCsv().lines[1]).toBe('Garden Suite,,,450000,3,11,,75000,Yes');
  });

  it('leaves out property names and the property roll-up with one property', async () => {
    renderAs();
    await findUnitTable();
    expect(screen.queryByText(/Sunmade Ikeja GRA/)).not.toBeInTheDocument();
    expect(screen.queryByRole('table', { name: 'Property performance' })).not.toBeInTheDocument();
  });

  it('adds property names, a property roll-up and its export with more than one property', async () => {
    api.fetchReports.mockResolvedValue(reportsData(twoPropertyReports()));
    renderAs();
    const table = await findUnitTable();
    expect(within(bodyRows(table)[1]).getByText('Sunmade Lekki')).toBeInTheDocument();
    expect(within(lowestOccupancyRows()[0]).getByText('Sunmade Lekki')).toBeInTheDocument();

    await userEvent.type(searchBox(), 'lekki');
    expectLabels(bodyRows(table), ['Harbour Suite', 'Lagoon Studio']);

    const properties = screen.getByRole('table', { name: 'Property performance' });
    expect(bodyRows(properties).map(cellTexts)).toEqual([
      ['Sunmade Ikeja GRA', '₦750,000', '5', '20', '33.3%', '₦68,182'],
      ['Sunmade Lekki', '₦500,000', '3', '10', '16.7%', '₦50,000'],
    ]);
    expect(totalsRow(properties)).toEqual(['Total', '₦1,250,000', '8', '30', '—', '—']);

    await clickExport('Export units');
    await clickExport('Export properties');
    expect(exportedCsv(0).filename).toBe('unit-performance-2026-09-10-to-2026-10-09');
    expect(exportedCsv(0).lines).toHaveLength(5);
    expect(exportedCsv(1).filename).toBe('property-performance-2026-09-10-to-2026-10-09');
    expect(exportedCsv(1).lines.slice(1)).toEqual([
      'Sunmade Ikeja GRA,750000,5,20,33.3,68181.82',
      'Sunmade Lekki,500000,3,10,16.7,50000',
    ]);
  });

  it('shows the channel mix; Airbnb / Booking.com stays have no price', async () => {
    renderAs();
    expect(await screen.findByText('Channel mix')).toBeInTheDocument();
    expect(screen.getByText('Booked by staff')).toBeInTheDocument();
    expect(screen.getByText('57.1%')).toBeInTheDocument();
    expect(screen.getByText('2 bookings · 4 nights')).toBeInTheDocument();
    expect(screen.getByText('Price not shared')).toBeInTheDocument();
  });

  it('reloads for another period', async () => {
    renderAs();
    await screen.findByText('Finance summary');
    api.fetchReports.mockResolvedValue(reportsData({ period: '12m' }));
    await userEvent.click(screen.getByRole('radio', { name: '12M' }));
    await waitFor(() => expect(api.fetchReports).toHaveBeenLastCalledWith('12m'));
    expect(await screen.findAllByText('vs previous 12 months')).toHaveLength(4);
  });

  it('tells staff without reports access instead of loading', async () => {
    renderAs([]);
    expect(await screen.findByText('Reports are available to owners, admins and managers.')).toBeInTheDocument();
    expect(api.fetchReports).not.toHaveBeenCalled();
  });
});
