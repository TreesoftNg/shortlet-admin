'use client';

import { Box, Flex, Text } from '@chakra-ui/react';

type PropertyCellProps = {
  name?: string | null;
  subtitle?: string | null;
  imageUrl?: string | null;
  imageAlt?: string;
};

/** Thumbnail + primary/secondary text — used in bookings, properties, payments tables. */
export function PropertyCell({
  name,
  subtitle,
  imageUrl,
  imageAlt = '',
}: PropertyCellProps) {
  return (
    <Flex align="center" gap="12px" minW={0}>
      {imageUrl ? (
        <Box
          as="img"
          src={imageUrl}
          alt={imageAlt}
          w="48px"
          h="40px"
          borderRadius="8px"
          objectFit="cover"
          flexShrink={0}
        />
      ) : null}
      <Box minW={0}>
        <Text fontWeight={700} noOfLines={1}>
          {name ?? '—'}
        </Text>
        {subtitle ? (
          <Text color="ink.300" fontSize="12px" noOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
    </Flex>
  );
}
