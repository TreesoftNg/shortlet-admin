import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test-utils/render-with-providers';
import { apiBlob, apiClient } from '@/shared/api/client';
import { ApiClientError } from '@/shared/api/types';
import { GuestIdRow } from './guest-id-row';
jest.mock('@/shared/api/client');
const request = jest.mocked(apiClient);
const download = jest.mocked(apiBlob);
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
  it('asks to allow pop-ups without downloading the ID', async () => {
    jest.spyOn(window, 'open').mockReturnValue(null);
    const createUrl = jest.fn();
    Object.assign(URL, { createObjectURL: createUrl });
    renderWithProviders(
      <GuestIdRow bookingId="b1" document={{ type: 'nin' }} canAttach={false} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Allow pop-ups to view the ID',
    );
    expect(download).not.toHaveBeenCalled();
    expect(createUrl).not.toHaveBeenCalled();
  });
  it('refuses to open a file that is not a PDF or image', async () => {
    const tab = { close: jest.fn(), location: { href: '' }, opener: {} };
    jest.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);
    download.mockResolvedValue(new Blob(['<script>'], { type: 'text/html' }));
    renderWithProviders(
      <GuestIdRow bookingId="b1" document={{ type: 'nin' }} canAttach={false} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'View' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'can’t be opened here',
    );
    expect(tab.close).toHaveBeenCalled();
    expect(tab.location.href).toBe('');
  });
  it('shows the API field message and lets staff retry the same file', async () => {
    request.mockRejectedValueOnce(
      new ApiClientError('The request contains invalid data', {
        status: 400,
        code: 'VALIDATION_ERROR',
        details: { fields: { file: ['Choose a JPEG, PNG, WebP or PDF file'] } },
      }),
    );
    renderWithProviders(
      <GuestIdRow bookingId="b1" document={null} canAttach />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Attach ID' }));
    const file = new File(['%PDF-'], 'id.pdf', { type: 'application/pdf' });
    await userEvent.upload(screen.getByLabelText('Attach ID file'), file);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Choose a JPEG, PNG, WebP or PDF file',
    );
    expect(screen.getByLabelText('Attach ID file')).toHaveValue('');
  });
});
