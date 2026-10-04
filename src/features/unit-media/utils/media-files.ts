export const MAX_PHOTOS_PER_UNIT = 40;
export const MAX_VIDEOS_PER_UNIT = 5;
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 150 * 1024 * 1024;

const PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isPhotoFile(file: File): boolean {
  return PHOTO_TYPES.has(file.type);
}

export function isVideoFile(file: File): boolean {
  return file.type === 'video/mp4';
}

export function photoFileError(file: File): string | null {
  if (!isPhotoFile(file)) return 'Photos must be JPEG, PNG or WebP.';
  if (file.size > MAX_PHOTO_BYTES) {
    return `Photos must be ${formatBytes(MAX_PHOTO_BYTES)} or smaller.`;
  }
  return null;
}

export function videoFileError(file: File): string | null {
  if (!isVideoFile(file)) return 'Videos must be MP4.';
  if (file.size > MAX_VIDEO_BYTES) {
    return `Videos must be ${formatBytes(MAX_VIDEO_BYTES)} or smaller.`;
  }
  return null;
}

export function classifyFile(file: File): { kind: 'photo' | 'video'; error: string | null } {
  if (isPhotoFile(file) || file.type.startsWith('image/')) {
    return { kind: 'photo', error: photoFileError(file) };
  }
  if (isVideoFile(file) || file.type.startsWith('video/')) {
    return { kind: 'video', error: videoFileError(file) };
  }
  return { kind: 'photo', error: 'Use a JPEG, PNG, WebP photo or an MP4 video.' };
}

export function photoLimitError(currentPhotos: number): string | null {
  if (currentPhotos >= MAX_PHOTOS_PER_UNIT) {
    return `A unit can have at most ${MAX_PHOTOS_PER_UNIT} photos.`;
  }
  return null;
}

export function videoLimitError(currentVideos: number): string | null {
  if (currentVideos >= MAX_VIDEOS_PER_UNIT) {
    return `A unit can have at most ${MAX_VIDEOS_PER_UNIT} videos.`;
  }
  return null;
}
