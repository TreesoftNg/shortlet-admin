import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AdminProfile } from '@/features/auth/types';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as reviewsApi from '../api/reviews-service';
import { review } from '../test-fixtures';
import { ReviewsPage } from './reviews-page';

jest.mock('../api/reviews-service');
const api = jest.mocked(reviewsApi);

function renderAs(permissions = ['review.read', 'review.manage']) {
  const queryClient = createTestQueryClient();
  const profile: AdminProfile = {
    user: { id: 'u1', email: 'ada@example.com', firstName: 'Ada', lastName: 'Okafor' },
    tenant: { id: 't1', slug: 'sunmade', name: 'Sunmade' },
    role: { code: 'owner', name: 'Owner' },
    permissions,
  };
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: profile });
  return renderWithProviders(<ReviewsPage />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.fetchReviews.mockResolvedValue([
    review({ status: 'pending' }),
    review({ id: 'rev-2', guestFullName: 'Temitope Aladesiun', status: 'published', canRespond: false }),
  ]);
  api.hideReview.mockResolvedValue(review({ status: 'hidden' }));
  api.publishReview.mockResolvedValue(review({ status: 'published' }));
});

describe('ReviewsPage', () => {
  it('lists reviews from the API', async () => {
    renderAs();
    expect(await screen.findByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText('Temitope Aladesiun')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Write a public response/i)).not.toBeInTheDocument();
  });

  it('hides the list without review.read', async () => {
    renderAs([]);
    expect(await screen.findByText('No access')).toBeInTheDocument();
    expect(api.fetchReviews).not.toHaveBeenCalled();
  });

  it('publishes a pending review when the staff can manage', async () => {
    renderAs();
    await userEvent.click(await screen.findByText('Sarah Johnson'));
    await userEvent.click(await screen.findByRole('button', { name: 'Publish' }));
    await waitFor(() => {
      expect(api.publishReview).toHaveBeenCalledWith('rev-1');
    });
  });

  it('hides publish and hide without review.manage', async () => {
    renderAs(['review.read']);
    await userEvent.click(await screen.findByText('Sarah Johnson'));
    expect(screen.queryByRole('button', { name: 'Publish' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument();
  });

  it('toasts API errors from hide', async () => {
    api.hideReview.mockRejectedValue(
      new ApiClientError('Could not hide this review', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderAs();
    await userEvent.click(await screen.findByText('Sarah Johnson'));
    await userEvent.click(await screen.findByRole('button', { name: 'Hide' }));
    expect(await screen.findByText('Could not hide')).toBeInTheDocument();
    expect(screen.getByText('Could not hide this review')).toBeInTheDocument();
  });
});
