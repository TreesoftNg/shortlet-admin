'use client';

import { Button, Flex, FormControl, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AppModal } from '@/shared/components/ui';
import type { UnitMedia } from '../types';

type EditMediaModalProps = {
  item: UnitMedia | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: { caption: string; altText: string }) => Promise<void>;
};

export function EditMediaModal({ item, isSaving, onClose, onSave }: EditMediaModalProps) {
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');

  useEffect(() => {
    setCaption(item?.caption ?? '');
    setAltText(item?.altText ?? '');
  }, [item]);

  return (
    <AppModal
      isOpen={Boolean(item)}
      onClose={onClose}
      title="Edit caption"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} isDisabled={isSaving}>
            Cancel
          </Button>
          <Button isLoading={isSaving} onClick={() => void onSave({ caption, altText })}>
            Save
          </Button>
        </>
      }
    >
      <Flex direction="column" gap="14px">
        <FormControl>
          <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
            Caption
          </FormLabel>
          <Input value={caption} onChange={(event) => setCaption(event.target.value)} borderRadius="12px" />
        </FormControl>
        <FormControl>
          <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
            Alt text
          </FormLabel>
          <Textarea
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            minH="90px"
            borderRadius="12px"
            placeholder="Describe the image for screen readers"
          />
        </FormControl>
      </Flex>
    </AppModal>
  );
}
