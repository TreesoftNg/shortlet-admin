import { apiClient } from '@/shared/api/client';
import { adminPath } from '@/shared/api/paths';
import type { MediaFields, UnitMedia, VideoUploadTicket } from '../types';
import { captureVideoPoster } from '../utils/video-poster';
import { putToStorage, uploadApiWithProgress, type UploadProgressFn } from './upload-with-progress';

export { putToStorage };

function mediaPath(unitId: string, suffix = ''): string {
  return adminPath(`/units/${encodeURIComponent(unitId)}/media${suffix}`);
}

export async function fetchUnitMedia(unitId: string): Promise<UnitMedia[]> {
  return (await apiClient<UnitMedia[]>(mediaPath(unitId))).data;
}

export async function uploadPhoto(
  unitId: string,
  file: File,
  fields: MediaFields = {},
  onProgress?: UploadProgressFn,
  signal?: AbortSignal,
): Promise<UnitMedia> {
  const body = new FormData();
  body.append('file', file);
  if (fields.caption) body.append('caption', fields.caption);
  if (fields.altText) body.append('altText', fields.altText);
  const response = await uploadApiWithProgress<UnitMedia>(mediaPath(unitId, '/photos'), body, {
    onProgress,
    signal,
  });
  return response.data;
}

export async function requestVideoUpload(
  unitId: string,
  input: { contentType: 'video/mp4'; sizeBytes: number } & MediaFields,
): Promise<VideoUploadTicket> {
  return (
    await apiClient<VideoUploadTicket>(mediaPath(unitId, '/videos'), {
      method: 'POST',
      body: input,
    })
  ).data;
}

export async function completeVideoUpload(
  unitId: string,
  mediaId: string,
  poster: Blob | null,
  durationSeconds: number | null,
  onProgress?: UploadProgressFn,
  signal?: AbortSignal,
): Promise<UnitMedia> {
  const body = new FormData();
  if (poster) body.append('poster', poster, 'poster.jpg');
  if (durationSeconds != null) body.append('durationSeconds', String(durationSeconds));
  const response = await uploadApiWithProgress<UnitMedia>(
    mediaPath(unitId, `/${encodeURIComponent(mediaId)}/complete`),
    body,
    { onProgress, signal },
  );
  return response.data;
}

export async function uploadVideo(
  unitId: string,
  file: File,
  onProgress?: UploadProgressFn,
  signal?: AbortSignal,
): Promise<UnitMedia> {
  const ticket = await requestVideoUpload(unitId, {
    contentType: 'video/mp4',
    sizeBytes: file.size,
  });
  await putToStorage(ticket.uploadUrl, file, ticket.headers, { onProgress, signal });
  const { poster, durationSeconds } = await captureVideoPoster(file);
  return completeVideoUpload(unitId, ticket.mediaId, poster, durationSeconds, undefined, signal);
}

export async function addVideoLink(
  unitId: string,
  input: { url: string } & MediaFields,
): Promise<UnitMedia> {
  return (
    await apiClient<UnitMedia>(mediaPath(unitId, '/links'), {
      method: 'POST',
      body: input,
    })
  ).data;
}

export async function updateMedia(
  unitId: string,
  mediaId: string,
  input: { caption?: string | null; altText?: string | null; isCover?: true },
): Promise<UnitMedia> {
  return (
    await apiClient<UnitMedia>(mediaPath(unitId, `/${encodeURIComponent(mediaId)}`), {
      method: 'PATCH',
      body: input,
    })
  ).data;
}

export async function reorderMedia(unitId: string, mediaIds: string[]): Promise<UnitMedia[]> {
  return (
    await apiClient<UnitMedia[]>(mediaPath(unitId, '/order'), {
      method: 'PUT',
      body: { mediaIds },
    })
  ).data;
}

export async function deleteMedia(unitId: string, mediaId: string): Promise<void> {
  await apiClient<null>(mediaPath(unitId, `/${encodeURIComponent(mediaId)}`), {
    method: 'DELETE',
  });
}
