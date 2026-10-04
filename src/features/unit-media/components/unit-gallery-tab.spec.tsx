import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryKeys } from '@/shared/api/query-keys';
import { ApiClientError } from '@/shared/api/types';
import { createTestQueryClient, renderWithProviders } from '@/test-utils/render-with-providers';
import * as mediaApi from '../api/unit-media-api';
import { useUploadQueueStore } from '../store/upload-queue-store';
import { adminProfile, mediaItem } from '../test-fixtures';
import { captureVideoPoster } from '../utils/video-poster';
import { UnitGalleryTab } from './unit-gallery-tab';

jest.mock('../api/unit-media-api');
jest.mock('../utils/video-poster', () => ({
  captureVideoPoster: jest.fn(),
}));

const api = jest.mocked(mediaApi);

function renderGallery(permissions = ['unit.update']) {
  const queryClient = createTestQueryClient();
  queryClient.setQueryData(queryKeys.auth.me(), { success: true, data: adminProfile(permissions) });
  return renderWithProviders(<UnitGalleryTab unitId="unit-1" />, queryClient);
}

beforeEach(() => {
  jest.resetAllMocks();
  useUploadQueueStore.getState().reset();
  api.fetchUnitMedia.mockResolvedValue([]);
  api.uploadPhoto.mockResolvedValue(mediaItem());
  api.requestVideoUpload.mockResolvedValue({
    mediaId: 'video-1',
    method: 'PUT',
    uploadUrl: 'https://storage.test/upload',
    headers: { 'Content-Type': 'video/mp4' },
    expiresAt: '2026-10-04T12:00:00.000Z',
  });
  api.putToStorage.mockResolvedValue(undefined);
  api.completeVideoUpload.mockResolvedValue(mediaItem({ id: 'video-1', kind: 'video' }));
  api.updateMedia.mockResolvedValue(mediaItem({ isCover: true }));
  api.deleteMedia.mockResolvedValue(undefined);
  api.reorderMedia.mockResolvedValue([]);
  api.addVideoLink.mockResolvedValue(mediaItem({ id: 'link-1', kind: 'video_link' }));
  jest.mocked(captureVideoPoster).mockResolvedValue({ poster: null, durationSeconds: 8 });
});

describe('UnitGalleryTab', () => {
  it('uploads at most three photos at once', async () => {
    let inflight = 0;
    let maxInflight = 0;
    api.uploadPhoto.mockImplementation(
      () =>
        new Promise((resolve) => {
          inflight += 1;
          maxInflight = Math.max(maxInflight, inflight);
          setTimeout(() => {
            inflight -= 1;
            resolve(mediaItem({ id: `p-${maxInflight}-${inflight}` }));
          }, 40);
        }),
    );
    renderGallery();
    await screen.findByText('Drop photos or MP4 videos here');

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const files = Array.from({ length: 5 }, (_, index) =>
      new File([new Uint8Array(8)], `photo-${index}.jpg`, { type: 'image/jpeg' }),
    );
    await userEvent.upload(input, files);

    await waitFor(() => {
      expect(useUploadQueueStore.getState().items.every((item) => item.status === 'done')).toBe(true);
    });
    expect(maxInflight).toBe(3);
    expect(api.uploadPhoto).toHaveBeenCalledTimes(5);
  });

  it('requests a video ticket, PUTs to storage, then completes', async () => {
    const order: string[] = [];
    api.requestVideoUpload.mockImplementation(async () => {
      order.push('request');
      return {
        mediaId: 'video-1',
        method: 'PUT' as const,
        uploadUrl: 'https://storage.test/upload',
        headers: { 'Content-Type': 'video/mp4' },
        expiresAt: '2026-10-04T12:00:00.000Z',
      };
    });
    api.putToStorage.mockImplementation(async () => {
      order.push('put');
    });
    api.completeVideoUpload.mockImplementation(async () => {
      order.push('complete');
      return mediaItem({ id: 'video-1', kind: 'video' });
    });

    renderGallery();
    await screen.findByText('Drop photos or MP4 videos here');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, [
      new File([new Uint8Array(8)], 'clip.mp4', { type: 'video/mp4' }),
    ]);

    await waitFor(() => expect(order).toEqual(['request', 'put', 'complete']));
  });

  it('sets cover and deletes after confirm', async () => {
    api.fetchUnitMedia.mockResolvedValue([mediaItem({ isCover: false })]);
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(true);
    renderGallery();

    await screen.findByText('Living room');
    await userEvent.click(screen.getByLabelText('Media actions'));
    await userEvent.click(await screen.findByText('Set as cover'));
    await waitFor(() => {
      expect(api.updateMedia).toHaveBeenCalledWith('unit-1', 'media-1', { isCover: true });
    });

    await userEvent.click(screen.getByLabelText('Media actions'));
    await userEvent.click(await screen.findByText('Delete'));
    expect(confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(api.deleteMedia).toHaveBeenCalledWith('unit-1', 'media-1');
    });
    confirm.mockRestore();
  });

  it('hides upload controls without unit.update', async () => {
    api.fetchUnitMedia.mockResolvedValue([mediaItem()]);
    renderGallery(['unit.read']);
    await screen.findByText('Living room');
    expect(screen.queryByText('Drop photos or MP4 videos here')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add video link/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Media actions')).not.toBeInTheDocument();
  });

  it('toasts API errors from mutations', async () => {
    api.fetchUnitMedia.mockResolvedValue([mediaItem()]);
    api.updateMedia.mockRejectedValue(
      new ApiClientError('Cover could not be saved', { code: 'INTERNAL_ERROR', status: 500 }),
    );
    renderGallery();
    await screen.findByText('Living room');
    await userEvent.click(screen.getByLabelText('Media actions'));
    await userEvent.click(await screen.findByText('Set as cover'));
    expect(await screen.findByText('Could not set cover')).toBeInTheDocument();
    expect(screen.getByText('Cover could not be saved')).toBeInTheDocument();
  });

  it('adds a YouTube link from the modal', async () => {
    renderGallery();
    await screen.findByRole('button', { name: /Add video link/i });
    await userEvent.click(screen.getByRole('button', { name: /Add video link/i }));
    await userEvent.type(screen.getByLabelText(/YouTube or Vimeo URL/i), 'https://youtu.be/abc123XYZ_-');
    await userEvent.click(screen.getByRole('button', { name: /Save link/i }));
    await waitFor(() => {
      expect(api.addVideoLink).toHaveBeenCalledWith('unit-1', {
        url: 'https://youtu.be/abc123XYZ_-',
        caption: undefined,
      });
    });
  });
});

describe('leave-upload-guard', () => {
  it('prompts before in-app navigation while uploads are active', async () => {
    const { useLeaveUploadGuard } = await import('../hooks/use-leave-upload-guard');
    function Probe() {
      useLeaveUploadGuard();
      return <a href="/units">Units</a>;
    }
    useUploadQueueStore.getState().enqueue([{ file: new File(['x'], 'a.jpg', { type: 'image/jpeg' }), kind: 'photo' }]);
    const confirm = jest.spyOn(window, 'confirm').mockReturnValue(false);
    const queryClient = createTestQueryClient();
    const { container } = renderWithProviders(<Probe />, queryClient);
    const link = container.querySelector('a')!;
    fireEvent.click(link);
    expect(confirm).toHaveBeenCalled();
    confirm.mockRestore();
    act(() => {
      useUploadQueueStore.getState().reset();
    });
  });
});
