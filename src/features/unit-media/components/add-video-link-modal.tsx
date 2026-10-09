'use client';

import { Box, Button, Flex, FormControl, FormLabel, Input, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { AppModal } from '@/shared/components/ui';
import { parseVideoLink } from '../utils/video-links';

type AddVideoLinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  isSaving: boolean;
  onSave: (url: string, caption: string) => Promise<void>;
};

export function AddVideoLinkModal({ isOpen, onClose, isSaving, onSave }: AddVideoLinkModalProps) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const parsed = useMemo(() => parseVideoLink(url), [url]);

  const handleClose = () => {
    setUrl('');
    setCaption('');
    onClose();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add video link"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} isDisabled={isSaving}>
            Cancel
          </Button>
          <Button
            isDisabled={!parsed}
            isLoading={isSaving}
            onClick={() => void onSave(url.trim(), caption.trim())}
          >
            Save link
          </Button>
        </>
      }
    >
      <Flex direction="column" gap="14px">
        <FormControl>
          <FormLabel>
            YouTube or Vimeo URL
          </FormLabel>
          <Input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://youtu.be/…"
           
          />
        </FormControl>
        <FormControl>
          <FormLabel>
            Caption
          </FormLabel>
          <Input
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
           
          />
        </FormControl>
        {url && !parsed ? (
          <Text fontSize="13px" color="red.500">
            Paste a YouTube or Vimeo link.
          </Text>
        ) : null}
        {parsed ? (
          <Box borderRadius="12px" overflow="hidden" border="1px solid" borderColor="line.500">
            <Box as="img" src={parsed.thumbnailUrl} alt="" w="100%" h="180px" objectFit="cover" />
          </Box>
        ) : null}
      </Flex>
    </AppModal>
  );
}
