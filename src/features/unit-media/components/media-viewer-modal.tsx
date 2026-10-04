'use client';

import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { AppModal } from '@/shared/components/ui';
import type { UnitMedia } from '../types';

type MediaViewerModalProps = {
  items: UnitMedia[];
  activeId: string | null;
  onClose: () => void;
  onActiveChange: (id: string) => void;
};

export function MediaViewerModal({ items, activeId, onClose, onActiveChange }: MediaViewerModalProps) {
  const index = items.findIndex((item) => item.id === activeId);
  const item = index >= 0 ? items[index] : null;
  const go = (delta: number) => {
    if (!items.length || index < 0) return;
    const next = items[(index + delta + items.length) % items.length];
    onActiveChange(next.id);
  };

  return (
    <AppModal
      isOpen={Boolean(item)}
      onClose={onClose}
      title={item?.caption || 'Media'}
      size="5xl"
      maxWidth="1080px"
      footer={
        item && items.length > 1 ? (
          <Flex w="100%" justify="space-between" align="center">
            <Button variant="secondary" leftIcon={<LuChevronLeft size={16} />} onClick={() => go(-1)}>
              Previous
            </Button>
            <Text fontSize="13px" color="ink.300">
              {index + 1} / {items.length}
            </Text>
            <Button variant="secondary" rightIcon={<LuChevronRight size={16} />} onClick={() => go(1)}>
              Next
            </Button>
          </Flex>
        ) : undefined
      }
    >
      {item ? <ViewerBody item={item} onPrev={() => go(-1)} onNext={() => go(1)} /> : null}
    </AppModal>
  );
}

function ViewerBody({
  item,
  onPrev,
  onNext,
}: {
  item: UnitMedia;
  onPrev: () => void;
  onNext: () => void;
}) {
  const large = item.sizes?.large ?? item.url;

  return (
    <Box position="relative">
      <IconButton
        aria-label="Previous"
        icon={<LuChevronLeft size={20} />}
        position="absolute"
        left="8px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={1}
        onClick={onPrev}
      />
      <IconButton
        aria-label="Next"
        icon={<LuChevronRight size={20} />}
        position="absolute"
        right="8px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={1}
        onClick={onNext}
      />
      {item.kind === 'photo' && large ? (
        <Box as="img" src={large} alt={item.altText ?? ''} w="100%" maxH="70vh" objectFit="contain" />
      ) : null}
      {item.kind === 'video' && item.url ? (
        <Box
          as="video"
          src={item.url}
          controls
          poster={item.sizes?.large ?? item.thumbnailUrl ?? undefined}
          w="100%"
          maxH="70vh"
        />
      ) : null}
      {item.kind === 'video_link' && item.link?.embedUrl ? (
        <Box
          as="iframe"
          src={item.link.embedUrl}
          title={item.caption ?? 'Video'}
          w="100%"
          h="420px"
          border="0"
          allowFullScreen
        />
      ) : null}
    </Box>
  );
}
