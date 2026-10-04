'use client';

import { Box, Button, Flex, Progress, Text } from '@chakra-ui/react';
import { formatBytes } from '../utils/media-files';
import { useUploadQueueStore } from '../store/upload-queue-store';

type UploadQueueProps = {
  onRetry: (id: string) => void;
};

export function UploadQueue({ onRetry }: UploadQueueProps) {
  const items = useUploadQueueStore((state) => state.items);
  const cancel = useUploadQueueStore((state) => state.cancel);
  const remove = useUploadQueueStore((state) => state.remove);
  const clearFinished = useUploadQueueStore((state) => state.clearFinished);

  if (items.length === 0) return null;

  return (
    <Box border="1px solid" borderColor="line.500" borderRadius="14px" p="14px">
      <Flex justify="space-between" align="center" mb="10px">
        <Text fontWeight={700} fontSize="13px">
          Uploads
        </Text>
        <Button size="sm" variant="ghost" onClick={clearFinished}>
          Clear finished
        </Button>
      </Flex>
      <Flex direction="column" gap="12px">
        {items.map((item) => (
          <Box key={item.id}>
            <Flex justify="space-between" gap="12px" align="flex-start">
              <Box minW={0}>
                <Text fontWeight={700} fontSize="14px" noOfLines={1}>
                  {item.file.name}
                </Text>
                <Text fontSize="12px" color="ink.300">
                  {formatBytes(item.file.size)} · {statusLabel(item.status)}
                </Text>
                {item.error ? (
                  <Text fontSize="12px" color="red.500" mt="2px">
                    {item.error}
                  </Text>
                ) : null}
              </Box>
              <Flex gap="6px" flexShrink={0}>
                {item.status === 'failed' ? (
                  <Button size="sm" variant="secondary" onClick={() => onRetry(item.id)}>
                    Retry
                  </Button>
                ) : null}
                {item.status === 'queued' || item.status === 'uploading' || item.status === 'processing' ? (
                  <Button size="sm" variant="secondary" onClick={() => cancel(item.id)}>
                    Cancel
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                    Dismiss
                  </Button>
                )}
              </Flex>
            </Flex>
            {item.status === 'uploading' || item.status === 'processing' ? (
              <Progress
                mt="8px"
                value={item.status === 'processing' ? 100 : item.progress}
                size="sm"
                borderRadius="full"
                colorScheme="green"
                isIndeterminate={item.status === 'processing'}
              />
            ) : null}
          </Box>
        ))}
      </Flex>
    </Box>
  );
}

function statusLabel(status: string): string {
  if (status === 'queued') return 'Waiting';
  if (status === 'uploading') return 'Uploading';
  if (status === 'processing') return 'Processing';
  if (status === 'done') return 'Done';
  return 'Failed';
}
