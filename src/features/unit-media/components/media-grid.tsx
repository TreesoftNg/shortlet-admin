'use client';

import { SimpleGrid } from '@chakra-ui/react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { UnitMedia } from '../types';
import { MediaCard, SortableMediaCard } from './media-card';

type MediaGridProps = {
  items: UnitMedia[];
  canEdit: boolean;
  onOpen: (item: UnitMedia) => void;
  onReorder: (ids: string[]) => void;
  onSetCover: (item: UnitMedia) => void;
  onEdit: (item: UnitMedia) => void;
  onDelete: (item: UnitMedia) => void;
};

export function MediaGrid({
  items,
  canEdit,
  onOpen,
  onReorder,
  onSetCover,
  onEdit,
  onDelete,
}: MediaGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = items.map((item) => item.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  const cards = items.map((item) => {
    const props = {
      item,
      canEdit,
      onOpen: () => onOpen(item),
      onSetCover: canEdit ? () => onSetCover(item) : undefined,
      onEdit: canEdit ? () => onEdit(item) : undefined,
      onDelete: canEdit ? () => onDelete(item) : undefined,
    };
    return canEdit ? (
      <SortableMediaCard key={item.id} {...props} />
    ) : (
      <MediaCard key={item.id} {...props} />
    );
  });

  if (!canEdit) {
    return (
      <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap="12px">
        {cards}
      </SimpleGrid>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap="12px">
          {cards}
        </SimpleGrid>
      </SortableContext>
    </DndContext>
  );
}
