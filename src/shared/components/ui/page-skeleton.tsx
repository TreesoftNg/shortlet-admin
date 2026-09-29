'use client';

import { Box, Flex, Grid, Skeleton, SkeletonText, type BoxProps } from '@chakra-ui/react';
import { Panel } from './panel';

export type PageSkeletonVariant =
  | 'table'
  | 'dashboard'
  | 'split'
  | 'form'
  | 'calendar';

export type PageSkeletonProps = BoxProps & {
  variant?: PageSkeletonVariant;
  rows?: number;
};

function TableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Flex direction="column" gap="12px" pt="8px">
      <Flex gap="12px" mb="6px">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} h="12px" flex="1" borderRadius="6px" />
        ))}
      </Flex>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Flex key={rowIndex} gap="12px" align="center">
          <Skeleton h="40px" w="40px" borderRadius="10px" flexShrink={0} />
          <Skeleton h="16px" flex="1.4" borderRadius="8px" />
          <Skeleton h="16px" flex="1" borderRadius="8px" />
          <Skeleton h="16px" flex="0.8" borderRadius="8px" />
          <Skeleton h="16px" flex="0.7" borderRadius="8px" />
        </Flex>
      ))}
    </Flex>
  );
}

/** Page-level loading skeleton for admin data views. */
export function PageSkeleton({
  variant = 'table',
  rows = 6,
  ...rest
}: PageSkeletonProps) {
  if (variant === 'dashboard') {
    return (
      <Box {...rest}>
        <Skeleton h="28px" w="220px" borderRadius="8px" mb="10px" />
        <Skeleton h="14px" w="160px" borderRadius="6px" mb="26px" />
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            xl: 'repeat(4, 1fr)',
          }}
          gap={{ base: '12px', md: '18px' }}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <Panel key={index}>
              <Skeleton h="14px" w="80px" borderRadius="6px" mb="14px" />
              <Skeleton h="32px" w="120px" borderRadius="8px" />
            </Panel>
          ))}
        </Grid>
        <Grid
          templateColumns={{ base: '1fr', xl: '1.8fr 1fr' }}
          gap={{ base: '12px', md: '18px' }}
          mt={{ base: '12px', md: '18px' }}
        >
          <Panel minH="320px">
            <Skeleton h="18px" w="160px" borderRadius="8px" mb="18px" />
            <Skeleton h="240px" borderRadius="14px" />
          </Panel>
          <Panel minH="320px">
            <Skeleton h="18px" w="140px" borderRadius="8px" mb="18px" />
            <Skeleton
              boxSize="120px"
              borderRadius="full"
              mx="auto"
              mb="18px"
            />
            <SkeletonText noOfLines={4} spacing="12px" />
          </Panel>
        </Grid>
        <Panel mt={{ base: '12px', md: '18px' }}>
          <Skeleton h="18px" w="150px" borderRadius="8px" mb="16px" />
          <TableRowsSkeleton rows={4} />
        </Panel>
      </Box>
    );
  }

  if (variant === 'split') {
    return (
      <Box {...rest}>
        <Skeleton h="28px" w="180px" borderRadius="8px" mb="10px" />
        <Skeleton h="14px" w="260px" borderRadius="6px" mb="26px" />
        <Grid
          templateColumns={{ base: '1fr', xl: '360px minmax(0, 1fr)' }}
          gap="18px"
        >
          <Panel minH="420px">
            <Skeleton h="36px" borderRadius="10px" mb="14px" />
            <Skeleton h="40px" borderRadius="12px" mb="16px" />
            <Flex direction="column" gap="12px">
              {Array.from({ length: 5 }).map((_, index) => (
                <Flex key={index} gap="12px" align="center">
                  <Skeleton boxSize="40px" borderRadius="full" />
                  <Box flex="1">
                    <Skeleton h="14px" w="70%" borderRadius="6px" mb="8px" />
                    <Skeleton h="12px" w="40%" borderRadius="6px" />
                  </Box>
                </Flex>
              ))}
            </Flex>
          </Panel>
          <Panel minH="420px">
            <Skeleton h="18px" w="180px" borderRadius="8px" mb="18px" />
            <SkeletonText noOfLines={8} spacing="14px" />
          </Panel>
        </Grid>
      </Box>
    );
  }

  if (variant === 'form') {
    return (
      <Box maxW="720px" {...rest}>
        <Skeleton h="28px" w="140px" borderRadius="8px" mb="10px" />
        <Skeleton h="14px" w="220px" borderRadius="6px" mb="26px" />
        <Panel mb="18px">
          <Skeleton h="18px" w="100px" borderRadius="8px" mb="16px" />
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index}>
                <Skeleton h="12px" w="70px" borderRadius="6px" mb="8px" />
                <Skeleton h="40px" borderRadius="12px" />
              </Box>
            ))}
          </Grid>
        </Panel>
        <Panel>
          <Skeleton h="18px" w="120px" borderRadius="8px" mb="16px" />
          <Flex direction="column" gap="14px">
            {Array.from({ length: 4 }).map((_, index) => (
              <Flex key={index} justify="space-between" align="center">
                <Skeleton h="14px" w="140px" borderRadius="6px" />
                <Skeleton h="24px" w="44px" borderRadius="full" />
              </Flex>
            ))}
          </Flex>
        </Panel>
      </Box>
    );
  }

  if (variant === 'calendar') {
    return (
      <Box {...rest}>
        <Skeleton h="28px" w="180px" borderRadius="8px" mb="10px" />
        <Skeleton h="14px" w="240px" borderRadius="6px" mb="26px" />
        <Panel>
          <Flex gap="10px" mb="16px" wrap="wrap">
            <Skeleton h="40px" w="160px" borderRadius="12px" />
            <Skeleton h="40px" w="120px" borderRadius="12px" />
            <Skeleton h="40px" w="100px" borderRadius="12px" />
          </Flex>
          <Skeleton h="360px" borderRadius="14px" />
        </Panel>
      </Box>
    );
  }

  return (
    <Box {...rest}>
      <Skeleton h="28px" w="180px" borderRadius="8px" mb="10px" />
      <Skeleton h="14px" w="260px" borderRadius="6px" mb="26px" />
      <Panel pt="18px" minW={0}>
        <Flex gap="8px" mb="14px" wrap="wrap">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} h="36px" w="90px" borderRadius="999px" />
          ))}
        </Flex>
        <Flex gap="10px" mb="16px" wrap="wrap">
          <Skeleton h="40px" flex="1" minW="200px" borderRadius="12px" />
          <Skeleton h="40px" w="140px" borderRadius="12px" />
        </Flex>
        <TableRowsSkeleton rows={rows} />
      </Panel>
    </Box>
  );
}
