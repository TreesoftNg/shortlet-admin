export type CapturedVideoPoster = {
  poster: Blob | null;
  durationSeconds: number | null;
};

function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadedmetadata = () => resolve(video);
    video.onerror = () => {
      cleanup();
      reject(new Error('Could not read the video.'));
    };
    video.src = url;
  });
}

function seek(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      resolve();
    };
    const onError = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      reject(new Error('Could not seek the video.'));
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = time;
  });
}

function canvasToJpeg(video: HTMLVideoElement): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85);
  });
}

/**
 * Seeks to about 1s, draws a JPEG poster, and returns duration.
 * On failure, complete the upload without a poster.
 */
export async function captureVideoPoster(file: File): Promise<CapturedVideoPoster> {
  try {
    const video = await loadVideo(file);
    const duration = Number.isFinite(video.duration) ? Math.round(video.duration) : null;
    const seekTo = duration && duration > 1 ? 1 : 0.1;
    await seek(video, seekTo);
    const poster = await canvasToJpeg(video);
    URL.revokeObjectURL(video.src);
    return { poster, durationSeconds: duration };
  } catch {
    return { poster: null, durationSeconds: null };
  }
}
