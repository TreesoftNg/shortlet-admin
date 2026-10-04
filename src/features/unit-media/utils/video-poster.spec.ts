import { captureVideoPoster } from './video-poster';

describe('captureVideoPoster', () => {
  it('completes without a poster when the video cannot be read', async () => {
    const file = new File(['not a video'], 'clip.mp4', { type: 'video/mp4' });
    await expect(captureVideoPoster(file)).resolves.toEqual({
      poster: null,
      durationSeconds: null,
    });
  });
});
