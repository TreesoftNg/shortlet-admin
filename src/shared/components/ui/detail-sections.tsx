'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

type KeyValueItem = {
  label: string;
  value: React.ReactNode;
  emphasize?: boolean;
};

type KeyValueListProps = {
  title?: string;
  items: KeyValueItem[];
};

export function KeyValueList({ title, items }: KeyValueListProps) {
  return (
    <Box py="16px" borderTop="1px solid" borderColor="line.500">
      {title ? (
        <Text
          fontSize="12px"
          textTransform="uppercase"
          letterSpacing="0.05em"
          color="ink.300"
          fontWeight={700}
          mb="10px"
        >
          {title}
        </Text>
      ) : null}
      {items.map((item) => (
        <Flex
          key={item.label}
          justify="space-between"
          gap="12px"
          fontSize="14px"
          my="7px"
          fontWeight={item.emphasize ? 800 : undefined}
        >
          <Text color={item.emphasize ? 'ink.500' : 'ink.400'}>{item.label}</Text>
          <Box textAlign="right">{item.value}</Box>
        </Flex>
      ))}
    </Box>
  );
}

type TimelineItem = {
  id: string;
  title: string;
  timestamp: string;
};

type ActivityTimelineProps = {
  title?: string;
  items: TimelineItem[];
};

export function ActivityTimeline({ title = 'Activity', items }: ActivityTimelineProps) {
  return (
    <Box py="16px" borderTop="1px solid" borderColor="line.500">
      <Text
        fontSize="12px"
        textTransform="uppercase"
        letterSpacing="0.05em"
        color="ink.300"
        fontWeight={700}
        mb="10px"
      >
        {title}
      </Text>
      <Box position="relative" pl="20px">
        <Box
          position="absolute"
          left="4px"
          top="8px"
          bottom="16px"
          w="1px"
          bg="line.500"
        />
        {items.map((item) => (
          <Box key={item.id} position="relative" fontSize="13px" mb="12px">
            <Box
              position="absolute"
              left="-20px"
              top="5px"
              w="9px"
              h="9px"
              borderRadius="full"
              bg="brand.500"
              boxShadow="0 0 0 3px var(--brand-100)"
            />
            <Text as="span" fontWeight={700}>
              {item.title}
            </Text>{' '}
            <Text as="span" color="ink.300">
              · {item.timestamp}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
