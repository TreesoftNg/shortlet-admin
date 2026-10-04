'use client';

import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { LuLink } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { EmptyState, ErrorState, PageSkeleton } from '@/shared/components/ui';
import { ApiClientError } from '@/shared/api/types';
import { useAddVideoLink, useDeleteMedia, useReorderMedia, useUpdateMedia } from '../hooks/use-unit-media-mutations';
import { useUnitMedia } from '../hooks/use-unit-media';
import { useUploadQueueRunner } from '../hooks/use-upload-queue-runner';
import { useUploadQueueStore } from '../store/upload-queue-store';
import type { UnitMedia } from '../types';
import { AddVideoLinkModal } from './add-video-link-modal';
import { EditMediaModal } from './edit-media-modal';
import { MediaDropzone } from './media-dropzone';
import { MediaGrid } from './media-grid';
import { MediaViewerModal } from './media-viewer-modal';
import { UploadQueue } from './upload-queue';

type UnitGalleryTabProps = {
  unitId: string;
};

export function UnitGalleryTab({ unitId }: UnitGalleryTabProps) {
  const toast = useToast();
  const { data: profile } = useMe();
  const canEdit = hasPermission(profile, 'unit.update');
  const { data: items = [], isLoading, isError, error, refetch } = useUnitMedia(unitId);
  const { retry } = useUploadQueueRunner(unitId);
  const enqueue = useUploadQueueStore((state) => state.enqueue);
  const queueItems = useUploadQueueStore((state) => state.items);
  const updateMedia = useUpdateMedia(unitId);
  const reorder = useReorderMedia(unitId);
  const remove = useDeleteMedia(unitId);
  const addLink = useAddVideoLink(unitId);

  const [viewerId, setViewerId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UnitMedia | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);

  const photos = items.filter((item) => item.kind === 'photo').length;
  const videos = items.filter((item) => item.kind !== 'photo').length;
  const pendingPhotos = queueItems.filter(
    (item) => item.kind === 'photo' && item.status !== 'done' && item.status !== 'failed',
  ).length;
  const pendingVideos = queueItems.filter(
    (item) => item.kind === 'video' && item.status !== 'done' && item.status !== 'failed',
  ).length;

  const showError = (title: string, err: unknown) => {
    toast({
      title,
      description: err instanceof ApiClientError || err instanceof Error ? err.message : undefined,
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  };

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load gallery'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Box>
      {canEdit ? (
        <Flex direction="column" gap="16px" mb="18px">
          <Flex justify="space-between" align="center" wrap="wrap" gap="10px">
            <Text fontSize="13px" color="ink.300">
              {photos} photos · {videos} videos
            </Text>
            <Button
              variant="secondary"
              h="40px"
              leftIcon={<LuLink size={16} />}
              onClick={() => setLinkOpen(true)}
            >
              Add video link
            </Button>
          </Flex>
          <MediaDropzone
            photoCount={photos + pendingPhotos}
            videoCount={videos + pendingVideos}
            onFiles={(files) => enqueue(files)}
          />
          <UploadQueue onRetry={retry} />
        </Flex>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          title="No media yet"
          description={
            canEdit
              ? 'Drop photos or videos, or add a YouTube/Vimeo link.'
              : 'This unit has no gallery items yet.'
          }
        />
      ) : (
        <MediaGrid
          items={items}
          canEdit={canEdit}
          onOpen={(item) => setViewerId(item.id)}
          onReorder={(ids) => {
            void reorder.mutateAsync(ids).catch((err) => showError('Could not reorder', err));
          }}
          onSetCover={(item) => {
            void updateMedia
              .mutateAsync({ mediaId: item.id, input: { isCover: true } })
              .catch((err) => showError('Could not set cover', err));
          }}
          onEdit={setEditing}
          onDelete={(item) => {
            if (!window.confirm('Remove this item from the gallery?')) return;
            void remove.mutateAsync(item.id).catch((err) => showError('Could not delete', err));
          }}
        />
      )}

      <MediaViewerModal
        items={items}
        activeId={viewerId}
        onClose={() => setViewerId(null)}
        onActiveChange={setViewerId}
      />
      <EditMediaModal
        item={editing}
        isSaving={updateMedia.isPending}
        onClose={() => setEditing(null)}
        onSave={async ({ caption, altText }) => {
          if (!editing) return;
          try {
            await updateMedia.mutateAsync({
              mediaId: editing.id,
              input: { caption, altText },
            });
            setEditing(null);
          } catch (err) {
            showError('Could not update media', err);
          }
        }}
      />
      <AddVideoLinkModal
        isOpen={linkOpen}
        onClose={() => setLinkOpen(false)}
        isSaving={addLink.isPending}
        onSave={async (url, caption) => {
          try {
            await addLink.mutateAsync({ url, caption: caption || undefined });
            setLinkOpen(false);
          } catch (err) {
            showError('Could not add video link', err);
          }
        }}
      />
    </Box>
  );
}
