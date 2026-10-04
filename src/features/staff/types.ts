/** Shapes from POST /cc/staff-invites (Owner invite and staff login). */

export type ApiStaffRole = 'owner' | 'admin' | 'manager' | 'staff';

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
