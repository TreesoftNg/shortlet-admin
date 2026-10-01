/** Shapes returned by the Shortlet API `/auth/*` endpoints. */

export type PermissionCode = string;

export type AdminProfile = {
  user: { id: string; email: string; firstName: string; lastName: string };
  tenant: { id: string; slug: string; name: string };
  role: { code: string; name: string };
  permissions: PermissionCode[];
};

export type LoginInput = {
  email: string;
  password: string;
  /** Only needed when the account belongs to several businesses. */
  tenantSlug?: string;
};

export type LoginResult = {
  tokenType: 'Bearer';
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  profile: AdminProfile;
};

/** Returned in `error.details` when a login matches several businesses. */
export type TenantChoice = { slug: string; name: string };
