/**
 * Public runtime configuration. Next.js inlines `NEXT_PUBLIC_*` values at
 * build time, so each must be read with a literal `process.env.NAME`.
 */
function requireUrl(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not set. Copy .env.example to .env and fill it in.`);
  }
  try {
    new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL, e.g. http://localhost:4000/api/v1`);
  }
  return value.replace(/\/+$/, '');
}

export const env = {
  /** Shortlet API base, including the version prefix. */
  get apiUrl(): string {
    return requireUrl('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL);
  },
  /**
   * Tenant slug for local/preview hosts that are not on a registered domain.
   * Sent as `x-tenant-slug` when set (e.g. `sunmade`).
   */
  get tenantSlug(): string | null {
    const value = process.env.NEXT_PUBLIC_TENANT_SLUG?.trim();
    return value || null;
  },
};
