export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  calendarSync: {
    all: ['calendar-sync'] as const,
    units: () => ['calendar-sync', 'units'] as const,
    importFeed: (unitId: string) => ['calendar-sync', 'units', unitId, 'import'] as const,
    bookings: (unitId: string, scope: string) => ['calendar-sync', 'units', unitId, 'bookings', scope] as const,
    blocks: (unitId: string) => ['calendar-sync', 'units', unitId, 'blocks'] as const,
    exportFeed: (unitId: string) => ['calendar-sync', 'units', unitId, 'export'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    summary: (period?: string) => ['dashboard', 'summary', period ?? '30d'] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['bookings', 'list', filters ?? {}] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
  /** @deprecated Use bookings.* — kept for dashboard mock until it is wired. */
  reservations: {
    all: ['reservations'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['reservations', 'list', filters ?? {}] as const,
    detail: (id: string) => ['reservations', 'detail', id] as const,
  },
  availability: {
    all: ['availability'] as const,
    calendar: (params: Record<string, unknown>) =>
      ['availability', 'calendar', params] as const,
  },
  properties: {
    all: ['properties'] as const,
    list: () => ['properties', 'list'] as const,
    detail: (id: string) => ['properties', 'detail', id] as const,
  },
  units: {
    all: ['units'] as const,
    list: () => ['units', 'list'] as const,
    detail: (id: string) => ['units', 'detail', id] as const,
  },
  unitMedia: {
    all: ['unit-media'] as const,
    list: (unitId: string) => ['unit-media', 'list', unitId] as const,
  },
  facilities: {
    all: ['facilities'] as const,
    list: () => ['facilities', 'list'] as const,
  },
  customers: {
    all: ['customers'] as const,
    list: () => ['customers', 'list'] as const,
  },
  messages: {
    all: ['messages'] as const,
    conversations: () => ['messages', 'conversations'] as const,
    thread: (conversationId: string) =>
      ['messages', 'thread', conversationId] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    list: () => ['reviews', 'list'] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['payments', 'list', filters ?? {}] as const,
    detail: (id: string) => ['payments', 'detail', id] as const,
  },
  refunds: {
    all: ['refunds'] as const,
    list: () => ['refunds', 'list'] as const,
  },
  reports: {
    all: ['reports'] as const,
    summary: () => ['reports', 'summary'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: () => ['staff', 'list'] as const,
  },
  settings: {
    all: ['settings'] as const,
    detail: () => ['settings', 'detail'] as const,
  },
} as const;
