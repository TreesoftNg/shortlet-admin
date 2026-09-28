'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

type MobileCardListProps<T> = {
  data: T[];
  getRowId: (row: T) => string;
  renderCard: (row: T) => ReactNode;
  emptyMessage?: string;
};

/** Stacked card list for table data on small screens. */
export function MobileCardList<T>({
  data,
  getRowId,
  renderCard,
  emptyMessage = 'No records found',
}: MobileCardListProps<T>) {
  if (data.length === 0) {
    return (
      <Text color="ink.300" fontSize="14px" py="24px" textAlign="center">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="12px">
      {data.map((row) => (
        <Box
          key={getRowId(row)}
          border="1px solid"
          borderColor="line.400"
          borderRadius="14px"
          p="14px"
        >
          {renderCard(row)}
        </Box>
      ))}
    </Flex>
  );
}
