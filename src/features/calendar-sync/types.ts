/** Shapes returned by the Shortlet API admin calendar endpoints (dates are ISO strings). */

export type ImportFeed = {
  unitId: string;
  provider: string;
  host: string;
  status: string;
  lastFetchedAt: string | null;
  lastSucceededAt: string | null;
  lastError: string | null;
  consecutiveFailures: number;
  nextFetchAt: string;
  awaitingEmptyFeedConfirmation: boolean;
  upcomingEventCount: number;
};

export type ExportFeed = {
  unitId: string;
  createdAt: string;
  issuedAt: string;
  lastAccessedAt: string | null;
};

export type UnitCalendarSummary = {
  unitId: string;
  name: string;
  publicName: string | null;
  status: string;
  hospitablePropertyId: string | null;
  timezone: string | null;
  feed: ImportFeed | null;
  exportFeed: ExportFeed | null;
  upcomingBlockCount: number;
};

export type SyncOutcome = 'synced' | 'unchanged' | 'awaiting_confirmation' | 'failed' | 'locked';

export type SyncResult = {
  feedId: string;
  unitId: string;
  outcome: SyncOutcome;
  eventsInFeed: number;
  created: number;
  updated: number;
  removed: number;
  error: string | null;
};

export type ConnectImportFeedResult = { feed: ImportFeed; sync: SyncResult };

export type DisconnectImportFeedResult = { releasedEvents: number };

export type ImportedBooking = {
  id: string;
  source: string;
  externalUid: string;
  reservationCode: string | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  adults: number | null;
  children: number | null;
  checkIn: string;
  checkOut: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'removed';
  firstSeenAt: string;
  lastSeenAt: string;
  removedAt: string | null;
};

export type BookingScope = 'upcoming' | 'all';

export type BlockReason = 'maintenance' | 'owner_stay' | 'other';

export type AvailabilityBlock = {
  id: string;
  unitId: string;
  startDate: string;
  endDate: string;
  nights: number;
  reason: BlockReason;
  note: string | null;
  createdAt: string;
};

export type CreateBlockInput = {
  startDate: string;
  endDate: string;
  reason: BlockReason;
  note?: string;
};

export type IssuedExportFeed = {
  /** Shown once: paste into Hospitable's iCal import. */
  url: string;
  rotated: boolean;
  feed: ExportFeed;
};
