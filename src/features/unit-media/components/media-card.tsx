'use client';

import {
  Box,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { LuEllipsis, LuPlay } from 'react-icons/lu';
import type { UnitMedia } from '../types';

type MediaCardProps = {
  item: UnitMedia;
  canEdit: boolean;
  onOpen: () => void;
  onSetCover?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function SortableMediaCard(props: MediaCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  return (
    <Box
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      opacity={isDragging ? 0.6 : 1}
      {...attributes}
      {...listeners}
    >
      <MediaCard {...props} />
    </Box>
  );
}

export function MediaCard({ item, canEdit, onOpen, onSetCover, onEdit, onDelete }: MediaCardProps) {
  const thumb = item.thumbnailUrl ?? item.sizes?.thumb ?? item.url;
  const duration = formatDuration(item.durationSeconds);

  return (
    <Box
      border="1px solid"
      borderColor="line.500"
      borderRadius="14px"
      overflow="hidden"
      bg="white"
      position="relative"
    >
      <Box
        as="button"
        type="button"
        w="100%"
        h="140px"
        bg="bg.400"
        onClick={onOpen}
        cursor="pointer"
      >
        {thumb ? (
          <Box as="img" src={thumb} alt={item.altText ?? ''} w="100%" h="140px" objectFit="cover" />
        ) : (
          <Flex h="140px" align="center" justify="center" color="ink.300">
            No preview
          </Flex>
        )}
        {item.kind !== 'photo' ? (
          <Flex
            position="absolute"
            top="10px"
            left="10px"
            bg="blackAlpha.700"
            color="white"
            borderRadius="full"
            px="8px"
            py="2px"
            align="center"
            gap="4px"
            fontSize="12px"
            fontWeight={700}
          >
            <LuPlay size={12} />
            {duration ?? 'Video'}
          </Flex>
        ) : null}
        {item.isCover ? (
          <Text
            position="absolute"
            top="10px"
            right="10px"
            bg="brand.500"
            color="white"
            fontSize="11px"
            fontWeight={800}
            px="8px"
            py="2px"
            borderRadius="full"
          >
            Cover
          </Text>
        ) : null}
      </Box>
      <Flex px="10px" py="8px" align="center" gap="8px">
        <Text fontSize="12px" color="ink.400" noOfLines={1} flex="1">
          {item.caption || (item.kind === 'photo' ? 'Photo' : 'Video')}
        </Text>
        {canEdit ? (
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Media actions"
              icon={<LuEllipsis size={16} />}
              size="sm"
              variant="ghost"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            />
            <MenuList fontSize="14px">
              {item.kind === 'photo' && onSetCover ? (
                <MenuItem onClick={onSetCover} isDisabled={item.isCover}>
                  Set as cover
                </MenuItem>
              ) : null}
              {onEdit ? <MenuItem onClick={onEdit}>Edit caption</MenuItem> : null}
              {onDelete ? (
                <MenuItem color="red.500" onClick={onDelete}>
                  Delete
                </MenuItem>
              ) : null}
            </MenuList>
          </Menu>
        ) : null}
      </Flex>
    </Box>
  );
}

export function formatDuration(seconds: number | null): string | null {
  if (seconds == null || !Number.isFinite(seconds)) return null;
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
