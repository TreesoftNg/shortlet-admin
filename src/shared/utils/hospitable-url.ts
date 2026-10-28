export function isHospitableUrl(value: string): boolean {
  if (value.length > 500) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (url.hostname === 'hospitable.com' ||
        url.hostname.endsWith('.hospitable.com'))
    );
  } catch {
    return false;
  }
}
export function canBlockInHospitable(
  url: string | null | undefined,
  status?: string,
): boolean {
  return Boolean(
    url &&
    isHospitableUrl(url) &&
    (status === undefined ||
      ['pending_payment', 'confirmed', 'checked_in'].includes(status)),
  );
}
