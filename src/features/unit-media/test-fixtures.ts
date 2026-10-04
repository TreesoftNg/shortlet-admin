import type { AdminProfile } from '@/features/auth/types';
import type { UnitMedia } from './types';

export const ALL_UNIT_PERMISSIONS = ['unit.update', 'unit.read'];

export function adminProfile(permissions = ALL_UNIT_PERMISSIONS): AdminProfile {
  return {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
}

export function mediaItem(overrides: Partial<UnitMedia> = {}): UnitMedia {
  return {
    id: 'media-1',
    unitId: 'unit-1',
    kind: 'photo',
    sortOrder: 0,
    isCover: false,
    caption: 'Living room',
    altText: 'Bright living room',
    url: 'https://cdn.test/large.jpg',
    thumbnailUrl: 'https://cdn.test/thumb.jpg',
    sizes: {
      thumb: 'https://cdn.test/thumb.jpg',
      medium: 'https://cdn.test/medium.jpg',
      large: 'https://cdn.test/large.jpg',
    },
    width: 1600,
    height: 900,
    durationSeconds: null,
    sizeBytes: 120_000,
    link: null,
    createdAt: '2026-10-04T10:00:00.000Z',
    ...overrides,
  };
}
