'use client';

import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react';
import { useCallback, useRef, useState } from 'react';
import { LuUpload } from 'react-icons/lu';
import { classifyFile, photoLimitError, videoLimitError } from '../utils/media-files';

type MediaDropzoneProps = {
  photoCount: number;
  videoCount: number;
  onFiles: (files: Array<{ file: File; kind: 'photo' | 'video' }>) => void;
};

export function MediaDropzone({ photoCount, videoCount, onFiles }: MediaDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  const ingest = useCallback(
    (list: FileList | File[]) => {
      const files = Array.from(list);
      const accepted: Array<{ file: File; kind: 'photo' | 'video' }> = [];
      let nextPhotos = photoCount;
      let nextVideos = videoCount;

      for (const file of files) {
        const classified = classifyFile(file);
        if (classified.error) {
          toast({ title: file.name, description: classified.error, status: 'warning', duration: 4000, isClosable: true });
          continue;
        }
        if (classified.kind === 'photo') {
          const limit = photoLimitError(nextPhotos);
          if (limit) {
            toast({ title: file.name, description: limit, status: 'warning', duration: 4000, isClosable: true });
            continue;
          }
          nextPhotos += 1;
        } else {
          const limit = videoLimitError(nextVideos);
          if (limit) {
            toast({ title: file.name, description: limit, status: 'warning', duration: 4000, isClosable: true });
            continue;
          }
          nextVideos += 1;
        }
        accepted.push({ file, kind: classified.kind });
      }

      if (accepted.length) onFiles(accepted);
    },
    [onFiles, photoCount, toast, videoCount],
  );

  return (
    <Box
      border="1px dashed"
      borderColor={dragging ? 'brand.500' : 'line.500'}
      bg={dragging ? 'brand.50' : 'bg.400'}
      borderRadius="16px"
      px="20px"
      py="28px"
      textAlign="center"
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        ingest(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4"
        hidden
        onChange={(event) => {
          if (event.target.files) ingest(event.target.files);
          event.target.value = '';
        }}
      />
      <Flex direction="column" align="center" gap="10px">
        <LuUpload size={22} />
        <Text fontWeight={700}>Drop photos or MP4 videos here</Text>
        <Text fontSize="13px" color="ink.300">
          JPEG, PNG or WebP up to 15 MB. MP4 up to 150 MB.
        </Text>
        <Button variant="secondary" h="40px" onClick={() => inputRef.current?.click()}>
          Choose files
        </Button>
      </Flex>
    </Box>
  );
}
