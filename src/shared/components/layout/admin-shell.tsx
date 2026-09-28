'use client';

import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { AdminSidebar } from './admin-sidebar';

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <Flex minH="100vh" bg="bg.400" direction={{ base: 'column', lg: 'row' }}>
      <AdminSidebar />
      <Box
        as="main"
        flex="1"
        px={{ base: '16px', md: '24px', xl: '36px' }}
        py={{ base: '16px', md: '24px', xl: '28px' }}
        minW={0}
        w="100%"
      >
        {children}
      </Box>
    </Flex>
  );
}
