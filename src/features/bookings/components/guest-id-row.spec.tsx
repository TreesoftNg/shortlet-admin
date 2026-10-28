import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import { apiClient } from '@/shared/api/client';
import { GuestIdRow } from './guest-id-row';
jest.mock('@/shared/api/client');
const request = jest.mocked(apiClient);
describe('Guest ID row', () => {
  it('shows the document type and View', () => {
    renderWithProviders(
      <GuestIdRow
        bookingId="b1"
        document={{ type: 'passport' }}
        canAttach={false}
      />,
    );
    expect(screen.getByText('ID: Passport')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Attach ID' }),
    ).not.toBeInTheDocument();
  });
  it('offers optional attachment only with booking.update', async () => {
    request.mockResolvedValue({
      success: true,
      data: { id: 'd1' },
      message: 'Attached',
      meta: { requestId: 'test' },
    });
    renderWithProviders(
      <GuestIdRow bookingId="b1" document={null} canAttach />,
    );
    expect(screen.getByText('No ID')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Attach ID' }));
    await userEvent.upload(
      screen.getByLabelText('Attach ID file'),
      new File(['%PDF-'], 'id.pdf', { type: 'application/pdf' }),
    );
    await waitFor(() =>
      expect(request).toHaveBeenCalledWith(
        '/cc/bookings/b1/id-document',
        expect.objectContaining({ method: 'POST', body: expect.any(FormData) }),
      ),
    );
  });
});
