/** Shapes from GET /cc/staff and POST /cc/staff-invites. */

export type ApiStaffRole = 'owner' | 'admin' | 'manager' | 'staff';

export type StaffListStatus = 'active' | 'invited' | 'suspended';

export type StaffListItem = {
  id: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: ApiStaffRole | string;
  roleName: string;
  status: StaffListStatus;
  avatarUrl: string | null;
  lastActiveAt: string | null;
  invitedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListStaffParams = {
  page?: number;
  limit?: number;
  tab?: 'all' | StaffListStatus;
  search?: string;
  role?: ApiStaffRole | 'all';
};

export type InviteStaffPayload = {
  email: string;
  firstName: string;
  lastName: string;
  role: ApiStaffRole;
};

export type SentStaffInvite = {
  email: string;
  role: ApiStaffRole | string;
  expiresAt: string;
};
