import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type {
  InviteStaffPayload,
  ListStaffParams,
  SentStaffInvite,
  StaffListItem,
} from '../types';

function buildQuery(params: ListStaffParams): string {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.tab && params.tab !== 'all') search.set('tab', params.tab);
  if (params.role && params.role !== 'all') search.set('role', params.role);
  if (params.search?.trim()) search.set('search', params.search.trim());
  const query = search.toString();
  return query ? `?${query}` : '';
}

/** GET /cc/staff — all pages for the tenant roster. */
export async function fetchStaff(
  params: Omit<ListStaffParams, 'page' | 'limit'> = {},
): Promise<StaffListItem[]> {
  const limit = 100;
  let page = 1;
  const all: StaffListItem[] = [];

  for (;;) {
    const response = await apiClient<StaffListItem[]>(
      adminPath(`/staff${buildQuery({ ...params, page, limit })}`),
    );
    all.push(...response.data);
    const totalPages = response.meta?.totalPages;
    if (!totalPages || page >= totalPages || response.data.length < limit) {
      break;
    }
    page += 1;
  }

  return all;
}

/** POST /cc/staff-invites — owner only; resending the same email replaces the link. */
export async function inviteStaff(
  payload: InviteStaffPayload,
): Promise<SentStaffInvite> {
  const response = await apiClient<SentStaffInvite>(adminPath('/staff-invites'), {
    method: 'POST',
    body: payload,
  });
  return response.data;
}
