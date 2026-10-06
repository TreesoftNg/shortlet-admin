/** `222000.00`, `NGN` → `₦222,000.00`. */
export function formatMoney(amount: string | number, currency = 'NGN'): string {
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, minimumFractionDigits: 2 }).format(
      Number(amount),
    );
  } catch {
    return `${currency} ${amount}`;
  }
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  pos: 'Card (POS)',
  card: 'Card',
  ussd: 'USSD',
};

export function paymentMethodLabel(method: string | null): string {
  return method ? (METHOD_LABELS[method] ?? method) : '—';
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting payment',
  confirmed: 'Confirmed',
  checked_in: 'Checked in',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired',
};

/** Message for an API error from the booking endpoints. */
export function bookingErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const { code, message } = error as { code: string; message: string };
    if (code === 'BOOKING_UNAVAILABLE') return 'Those nights are taken. Pick other dates.';
    return message;
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

/** First field error from an API VALIDATION_ERROR, keyed by field path. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object' || !('details' in error)) return {};
  const fields = (error as { details?: { fields?: Record<string, string[]> } }).details?.fields ?? {};
  return Object.fromEntries(Object.entries(fields).map(([field, messages]) => [field, messages[0] ?? '']));
}
