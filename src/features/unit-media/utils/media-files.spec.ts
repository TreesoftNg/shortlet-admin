import {
  classifyFile,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS_PER_UNIT,
  MAX_VIDEO_BYTES,
  MAX_VIDEOS_PER_UNIT,
  photoFileError,
  photoLimitError,
  videoFileError,
  videoLimitError,
} from './media-files';

function file(name: string, type: string, size = 10): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('media-files', () => {
  it('accepts JPEG, PNG and WebP under 15 MB', () => {
    expect(photoFileError(file('a.jpg', 'image/jpeg'))).toBeNull();
    expect(photoFileError(file('a.png', 'image/png'))).toBeNull();
    expect(photoFileError(file('a.webp', 'image/webp'))).toBeNull();
  });

  it('rejects oversized or unsupported photos', () => {
    expect(photoFileError(file('a.gif', 'image/gif'))).toBe('Photos must be JPEG, PNG or WebP.');
    expect(photoFileError(file('big.jpg', 'image/jpeg', MAX_PHOTO_BYTES + 1))).toMatch(/15.0 MB/);
  });

  it('accepts MP4 under 150 MB and rejects other videos', () => {
    expect(videoFileError(file('clip.mp4', 'video/mp4'))).toBeNull();
    expect(videoFileError(file('clip.mov', 'video/quicktime'))).toBe('Videos must be MP4.');
    expect(videoFileError(file('big.mp4', 'video/mp4', MAX_VIDEO_BYTES + 1))).toMatch(/150.0 MB/);
  });

  it('classifies files and enforces per-unit caps', () => {
    expect(classifyFile(file('a.jpg', 'image/jpeg'))).toEqual({ kind: 'photo', error: null });
    expect(classifyFile(file('clip.mp4', 'video/mp4'))).toEqual({ kind: 'video', error: null });
    expect(classifyFile(file('notes.pdf', 'application/pdf')).error).toMatch(/JPEG, PNG, WebP/);
    expect(photoLimitError(MAX_PHOTOS_PER_UNIT)).toMatch(/40 photos/);
    expect(videoLimitError(MAX_VIDEOS_PER_UNIT)).toMatch(/5 videos/);
    expect(photoLimitError(0)).toBeNull();
    expect(videoLimitError(0)).toBeNull();
  });
});
