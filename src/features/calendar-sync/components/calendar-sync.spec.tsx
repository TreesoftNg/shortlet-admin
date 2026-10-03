import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import type { AdminProfile } from '@/features/auth/types';
import * as calendarApi from '../api/calendar-sync-api';
import { useCalendarSyncUiStore } from '../store/calendar-sync-ui-store';
import type { ImportFeed, UnitCalendarSummary } from '../types';
import { BlockedDatesTab } from './blocked-dates-tab';
import { CalendarSyncPage } from './calendar-sync-page';
import { ExportTab } from './export-tab';
import { ImportTab } from './import-tab';
import { BookingsTab } from './bookings-tab';
import { TimelineTab } from './timeline-tab';

jest.mock('../api/calendar-sync-api');
const api = jest.mocked(calendarApi);

let search = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useSearchParams: () => search,
}));

const HOSPITABLE_URL = 'https://api.hospitable.com/v1/properties/reservations.ics?key=1&token=example';
const ALL_PERMISSIONS = ['integration.manage', 'availability.read', 'availability.manage'];

const feed: ImportFeed = {
  unitId: 'unit-1',
  provider: 'hospitable',
  host: 'api.hospitable.com',
  status: 'active',
  lastFetchedAt: new Date().toISOString(),
  lastSucceededAt: new Date().toISOString(),
  lastError: null,
  consecutiveFailures: 0,
  nextFetchAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  awaitingEmptyFeedConfirmation: false,
  upcomingEventCount: 2,
};

const unit = (overrides: Partial<UnitCalendarSummary> = {}): UnitCalendarSummary => ({
  unitId: 'unit-1',
  name: 'Charming 1bedroom',
  publicName: null,
  status: 'active',
  hospitablePropertyId: 'p1',
  timezone: 'Africa/Lagos',
  feed: null,
  exportFeed: null,
  upcomingBlockCount: 0,
  ...overrides,
});

/** Renders with a signed-in admin holding the given permissions. */
function renderAs(ui: React.ReactElement, permissions = ALL_PERMISSIONS) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(ui, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  search = new URLSearchParams();
  useCalendarSyncUiStore.setState({ selectedUnitId: null, activeTab: 'timeline' });
  api.fetchImportedBookings.mockResolvedValue([]);
  api.fetchBlocks.mockResolvedValue([]);
  api.fetchExportFeed.mockResolvedValue(null);
});

describe('CalendarSyncPage', () => {
  it("lists units with their import and export status, and opens a unit's calendar", async () => {
    api.fetchCalendarUnits.mockResolvedValue([unit({ feed }), unit({ unitId: 'unit-2', name: 'Elegant studio' })]);
    renderAs(<CalendarSyncPage />);

    const row = (await screen.findByText('Charming 1bedroom')).closest('tr')!;
    expect(within(row).getByText('Syncing')).toBeInTheDocument();
    expect(within(row).getByText('Not set up')).toBeInTheDocument();
    const disconnectedRow = screen.getByText('Elegant studio').closest('tr')!;
    expect(within(disconnectedRow).getByText('Not connected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sync all connected/i })).toBeInTheDocument();

    await userEvent.click(row);
    expect(useCalendarSyncUiStore.getState().selectedUnitId).toBe('unit-1');
    expect(await screen.findByRole('tab', { name: 'Timeline' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Blocked dates' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open in Availability/i })).toHaveAttribute(
      'href',
      '/availability?unitId=unit-1&unitName=Charming+1bedroom',
    );
  });

  it('opens a unit from the unitId query param', async () => {
    search = new URLSearchParams('unitId=unit-1');
    api.fetchCalendarUnits.mockResolvedValue([unit({ feed })]);
    renderAs(<CalendarSyncPage />);

    await waitFor(() => {
      expect(useCalendarSyncUiStore.getState().selectedUnitId).toBe('unit-1');
    });
    expect(await screen.findByRole('tab', { name: 'Timeline' })).toBeInTheDocument();
  });

  it('filters the list by health tab', async () => {
    api.fetchCalendarUnits.mockResolvedValue([
      unit({ feed }),
      unit({ unitId: 'unit-2', name: 'Elegant studio' }),
    ]);
    renderAs(<CalendarSyncPage />);

    await screen.findByText('Charming 1bedroom');
    await userEvent.click(screen.getByRole('button', { name: /Not connected/i }));
    expect(screen.queryByText('Charming 1bedroom')).not.toBeInTheDocument();
    expect(screen.getByText('Elegant studio')).toBeInTheDocument();
  });

  it('explains when the role has no access, without calling the API', () => {
    renderAs(<CalendarSyncPage />, ['availability.read']);

    expect(screen.getByText('No access')).toBeInTheDocument();
    expect(api.fetchCalendarUnits).not.toHaveBeenCalled();
  });
});

describe('ImportTab', () => {
  it('checks the link shape before connecting', async () => {
    renderAs(<ImportTab unit={unit()} />);

    await userEvent.type(screen.getByLabelText(/hospitable ical link/i), 'https://example.com/calendar');
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(await screen.findByText(/Use the Hospitable export link/)).toBeInTheDocument();
    expect(api.connectImportFeed).not.toHaveBeenCalled();
  });

  it('rejects an incomplete Hospitable link missing token', async () => {
    renderAs(<ImportTab unit={unit()} />);

    fireEvent.change(screen.getByLabelText(/hospitable ical link/i), {
      target: { value: 'https://api.hospitable.com/v1/properties/reservations.ics?key=1' },
    });
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(await screen.findByText(/including key and token/)).toBeInTheDocument();
    expect(api.connectImportFeed).not.toHaveBeenCalled();
  });

  it('explains empty-feed confirmation and shows Sync now', () => {
    renderAs(
      <ImportTab
        unit={unit({
          feed: { ...feed, awaitingEmptyFeedConfirmation: true },
        })}
      />,
    );

    expect(screen.getByText(/Empty feed — confirming/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sync now' })).toBeInTheDocument();
  });

  it('maps a conflict error when sync is already running', async () => {
    api.syncImportFeed.mockRejectedValue(
      new ApiClientError('Conflict', { code: 'RESOURCE_CONFLICT', status: 409 }),
    );
    renderAs(<ImportTab unit={unit({ feed })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Sync now' }));
    expect((await screen.findAllByText(/already running/i)).length).toBeGreaterThan(0);
  });

  it('connects a Hospitable link', async () => {
    api.connectImportFeed.mockResolvedValue({
      feed,
      sync: { feedId: 'f1', unitId: 'unit-1', outcome: 'synced', eventsInFeed: 1, created: 1, updated: 0, removed: 0, error: null },
    });
    renderAs(<ImportTab unit={unit()} />);

    fireEvent.change(screen.getByLabelText(/hospitable ical link/i), { target: { value: `  ${HOSPITABLE_URL} ` } });
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    await waitFor(() => expect(api.connectImportFeed).toHaveBeenCalledWith('unit-1', HOSPITABLE_URL));
  });

  it('shows the API error when Hospitable rejects the link', async () => {
    api.connectImportFeed.mockRejectedValue(
      new ApiClientError('The calendar provider rejected this link (HTTP 403).', { code: 'INTEGRATION_ERROR', status: 502 }),
    );
    renderAs(<ImportTab unit={unit()} />);

    fireEvent.change(screen.getByLabelText(/hospitable ical link/i), { target: { value: HOSPITABLE_URL } });
    await userEvent.click(screen.getByRole('button', { name: 'Connect' }));

    expect(await screen.findByText(/rejected this link/)).toBeInTheDocument();
  });

  it('syncs on demand and asks before disconnecting', async () => {
    api.syncImportFeed.mockResolvedValue({
      feedId: 'f1', unitId: 'unit-1', outcome: 'unchanged', eventsInFeed: 2, created: 0, updated: 0, removed: 0, error: null,
    });
    api.disconnectImportFeed.mockResolvedValue({ releasedEvents: 2 });
    renderAs(<ImportTab unit={unit({ feed })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Sync now' }));
    await waitFor(() => expect(api.syncImportFeed).toHaveBeenCalledWith('unit-1'));

    await userEvent.click(screen.getByRole('button', { name: 'Disconnect' }));
    expect(api.disconnectImportFeed).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('button', { name: 'Disconnect' })[0]);
    await waitFor(() => expect(api.disconnectImportFeed).toHaveBeenCalledWith('unit-1'));
  });

  it('never shows the stored link, only the host', () => {
    renderAs(<ImportTab unit={unit({ feed })} />);

    expect(screen.getByText('api.hospitable.com')).toBeInTheDocument();
    expect(screen.queryByDisplayValue(/token=/)).not.toBeInTheDocument();
  });
});

describe('TimelineTab', () => {
  it('renders imported bookings and blocks on a day grid', async () => {
    api.fetchImportedBookings.mockResolvedValue([
      {
        id: 'e1',
        source: 'hospitable',
        externalUid: 'x',
        reservationCode: 'QGUIPR',
        guestName: 'Ada Okafor',
        guestEmail: null,
        guestPhone: null,
        adults: 2,
        children: 0,
        checkIn: '',
        checkOut: '',
        startDate: '2026-10-02',
        endDate: '2026-10-05',
        status: 'active',
        firstSeenAt: '',
        lastSeenAt: '',
        removedAt: null,
      },
    ]);
    api.fetchBlocks.mockResolvedValue([
      {
        id: 'b1',
        unitId: 'unit-1',
        startDate: '2026-10-10',
        endDate: '2026-10-12',
        nights: 2,
        reason: 'maintenance',
        note: 'AC service',
        createdAt: '',
      },
    ]);

    renderAs(<TimelineTab unit={unit({ feed })} initialAnchorDate="2026-10-01" />);

    expect(await screen.findByText(/Ada Okafor/)).toBeInTheDocument();
    expect(screen.getByText('AC service')).toBeInTheDocument();
    expect(screen.getByText('Hospitable booking')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(screen.getByText(/Ada Okafor|AC service|No stays or blocks/)).toBeInTheDocument();
  });
});

describe('BookingsTab', () => {
  it('lists imported bookings with guest details and marks cancellations', async () => {
    api.fetchImportedBookings.mockResolvedValue([
      {
        id: 'e1', source: 'hospitable', externalUid: 'x', reservationCode: 'QGUIPR', guestName: 'Ada Okafor',
        guestEmail: 'ada@example.com', guestPhone: '+234 800', adults: 2, children: 0,
        checkIn: '', checkOut: '', startDate: '2026-10-02', endDate: '2026-10-04', status: 'removed',
        firstSeenAt: '', lastSeenAt: '', removedAt: '',
      },
    ]);
    renderAs(<BookingsTab unit={unit({ feed })} />);

    expect(await screen.findByText('Ada Okafor')).toBeInTheDocument();
    expect(screen.getByText(/Fri, 2 Oct 2026 → Sun, 4 Oct 2026/)).toBeInTheDocument();
    expect(screen.getByText(/2 nights/)).toBeInTheDocument();
    expect(screen.getByText(/ada@example.com/)).toBeInTheDocument();
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View in Bookings/i })).toHaveAttribute(
      'href',
      '/bookings?search=QGUIPR',
    );

    await userEvent.click(screen.getByRole('button', { name: /^All/i }));
    await waitFor(() => expect(api.fetchImportedBookings).toHaveBeenLastCalledWith('unit-1', 'all'));
  });
});

describe('BlockedDatesTab', () => {
  const block = {
    id: 'b1', unitId: 'unit-1', startDate: '2099-10-10', endDate: '2099-10-12', nights: 2,
    reason: 'maintenance' as const, note: 'AC service', createdAt: '',
  };

  it('creates a block, dropping an empty note', async () => {
    api.fetchBlocks.mockResolvedValue([]);
    api.createBlock.mockResolvedValue(block);
    renderAs(<BlockedDatesTab unit={unit()} />);

    fireEvent.change(screen.getByLabelText(/first night/i), { target: { value: '2099-10-10' } });
    fireEvent.change(screen.getByLabelText(/checkout day/i), { target: { value: '2099-10-12' } });
    await userEvent.selectOptions(screen.getByLabelText(/reason/i), 'owner_stay');
    await userEvent.click(screen.getByRole('button', { name: 'Block dates' }));

    await waitFor(() =>
      expect(api.createBlock).toHaveBeenCalledWith('unit-1', {
        startDate: '2099-10-10', endDate: '2099-10-12', reason: 'owner_stay', note: undefined,
      }),
    );
  });

  it('validates before calling the API', async () => {
    api.fetchBlocks.mockResolvedValue([]);
    renderAs(<BlockedDatesTab unit={unit()} />);

    fireEvent.change(screen.getByLabelText(/first night/i), { target: { value: '2099-10-12' } });
    fireEvent.change(screen.getByLabelText(/checkout day/i), { target: { value: '2099-10-10' } });
    await userEvent.click(screen.getByRole('button', { name: 'Block dates' }));

    expect(await screen.findByText('Checkout must be after the first night.')).toBeInTheDocument();
    expect(api.createBlock).not.toHaveBeenCalled();
  });

  it('lists and removes blocks', async () => {
    api.fetchBlocks.mockResolvedValue([block]);
    api.deleteBlock.mockResolvedValue();
    renderAs(<BlockedDatesTab unit={unit()} />);

    expect(await screen.findByText('AC service')).toBeInTheDocument();
    expect(screen.getByText(/Sat, 10 Oct 2099 → Mon, 12 Oct 2099/)).toBeInTheDocument();
    expect(screen.getByText('2 nights')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove block starting 2099-10-10' }));
    expect(api.deleteBlock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Remove block' }));
    await waitFor(() => expect(api.deleteBlock).toHaveBeenCalledWith('unit-1', 'b1'));
  });

  it('warns when the new range overlaps an existing block', async () => {
    api.fetchBlocks.mockResolvedValue([block]);
    renderAs(<BlockedDatesTab unit={unit()} />);

    fireEvent.change(await screen.findByLabelText(/first night/i), {
      target: { value: '2099-10-11' },
    });
    fireEvent.change(screen.getByLabelText(/checkout day/i), {
      target: { value: '2099-10-13' },
    });

    expect(await screen.findByText(/Overlaps an existing block/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Block dates' })).toBeDisabled();
  });

  it('is read-only without availability.manage', async () => {
    api.fetchBlocks.mockResolvedValue([block]);
    renderAs(<BlockedDatesTab unit={unit()} />, ['integration.manage', 'availability.read']);

    expect(await screen.findByText('AC service')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Block dates' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove block/ })).not.toBeInTheDocument();
  });
});

describe('ExportTab', () => {
  const exportFeed = { unitId: 'unit-1', createdAt: '', issuedAt: new Date().toISOString(), lastAccessedAt: null };
  const STAGING_URL = `https://api-staging.sunmadeapartments.com/api/v1/calendars/units/unit-1/${'A'.repeat(43)}.ics`;

  it('creates a link and shows it once with Hospitable steps', async () => {
    api.fetchExportFeed.mockResolvedValue(null);
    api.issueExportFeed.mockResolvedValue({ url: STAGING_URL, rotated: false, feed: exportFeed });
    renderAs(<ExportTab unit={unit()} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Create export link' }));

    expect(await screen.findByDisplayValue(STAGING_URL)).toBeInTheDocument();
    expect(screen.getAllByText(/will not be shown again/).length).toBeGreaterThan(0);
    expect(screen.getByText('Add it in Hospitable')).toBeInTheDocument();
    expect(screen.queryByText(/local address/)).not.toBeInTheDocument();
  });

  it('warns that a localhost link cannot work', async () => {
    api.fetchExportFeed.mockResolvedValue(null);
    api.issueExportFeed.mockResolvedValue({
      url: 'http://localhost:4000/api/v1/calendars/units/unit-1/x.ics', rotated: false, feed: exportFeed,
    });
    renderAs(<ExportTab unit={unit()} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Create export link' }));

    expect(await screen.findByText(/local address/)).toBeInTheDocument();
  });

  it('shows an existing link as status only, and confirms before rotating it', async () => {
    api.fetchExportFeed.mockResolvedValue(exportFeed);
    api.issueExportFeed.mockResolvedValue({ url: STAGING_URL, rotated: true, feed: exportFeed });
    renderAs(<ExportTab unit={unit()} />);

    expect(await screen.findByText('Waiting for Hospitable')).toBeInTheDocument();
    expect(screen.getByText(/first fetch/i)).toBeInTheDocument();
    expect(screen.queryByDisplayValue(/\.ics$/)).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Rotate link' }));
    expect(screen.getByText(/stops working immediately/)).toBeInTheDocument();
    expect(api.issueExportFeed).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('button', { name: 'Rotate link' })[0]);

    expect(await screen.findByDisplayValue(STAGING_URL)).toBeInTheDocument();
    expect(screen.getByText(/New link — copy it now/i)).toBeInTheDocument();
  });

  it('guides when Hospitable has not fetched recently', async () => {
    api.fetchExportFeed.mockResolvedValue({
      ...exportFeed,
      lastAccessedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    });
    renderAs(<ExportTab unit={unit()} />);

    expect((await screen.findAllByText('Not fetched recently')).length).toBeGreaterThan(0);
    expect(screen.getByText(/has not requested this feed/i)).toBeInTheDocument();
  });

  it('disables the link after confirmation', async () => {
    api.fetchExportFeed.mockResolvedValue(exportFeed);
    api.revokeExportFeed.mockResolvedValue();
    renderAs(<ExportTab unit={unit()} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Disable link' }));
    expect(api.revokeExportFeed).not.toHaveBeenCalled();
    await userEvent.click(screen.getAllByRole('button', { name: 'Disable link' })[0]);

    await waitFor(() => expect(api.revokeExportFeed).toHaveBeenCalledWith('unit-1'));
  });
});
