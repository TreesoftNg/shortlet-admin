/**
 * Admin console routes live under `/cc` (command center).
 * Public routes (invite accept, iCal feeds, waitlist) stay unprefixed.
 */
export function adminPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/cc${normalized}`;
}
