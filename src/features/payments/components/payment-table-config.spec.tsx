import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import { getPaymentStatusDisplay } from '@/features/bookings/utils/booking-display';
import { paymentListItem } from '../test-fixtures';
import { getPaymentColumns } from './payment-table-config';

describe('getPaymentColumns', () => {
  const column = (id: string) => {
    const found = getPaymentColumns().find((item) => item.id === id);
    if (!found) throw new Error(`No ${id} column`);
    return found;
  };

  it('returns payment list columns', () => {
    expect(getPaymentColumns().map((item) => item.id)).toEqual([
      'guest',
      'amount',
      'status',
      'provider',
      'created',
      'updated',
    ]);
  });

  it('shows a part-refunded payment as booking details does', () => {
    const row = paymentListItem({
      amount: '429750.00',
      amountRefunded: '354750.00',
      status: 'partially_refunded',
    });
    renderWithProviders(
      <>
        {column('amount').cell(row)}
        {column('status').cell(row)}
      </>,
    );

    expect(screen.getByText('₦429,750')).toBeInTheDocument();
    expect(screen.getByText('₦354,750 of ₦429,750 refunded')).toBeInTheDocument();
    expect(
      screen.getByText(getPaymentStatusDisplay('partially_refunded').label),
    ).toHaveTextContent('Partly refunded');
  });

  it('shows only the amount when nothing was refunded', () => {
    renderWithProviders(<>{column('amount').cell(paymentListItem())}</>);
    expect(screen.queryByText(/refunded/)).not.toBeInTheDocument();
  });
});
