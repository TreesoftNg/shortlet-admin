export type UnitMediaKind = 'photo' | 'video' | 'video_link';

export type VideoLinkProvider = 'youtube' | 'vimeo';

export type UnitMedia = {
  id: string;
  unitId: string;
  kind: UnitMediaKind;
  sortOrder: number;
  isCover: boolean;
  caption: string | null;
  altText: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  sizes: { thumb: string; medium: string; large: string } | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  sizeBytes: number | null;
  link: { provider: VideoLinkProvider; videoId: string; embedUrl: string } | null;
  createdAt: string;
};

export type VideoUploadTicket = {
  mediaId: string;
  method: 'PUT';
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
};

export type MediaFields = {
  caption?: string;
  altText?: string;
};

export type UploadQueueStatus = 'queued' | 'uploading' | 'processing' | 'done' | 'failed';

export type UploadQueueKind = 'photo' | 'video';

export type UploadQueueItem = {
  id: string;
  file: File;
  kind: UploadQueueKind;
  status: UploadQueueStatus;
  progress: number;
  error: string | null;
  abortController: AbortController;
};
