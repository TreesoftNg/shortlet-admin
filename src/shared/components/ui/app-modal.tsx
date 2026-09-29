'use client';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useBreakpointValue,
  type ModalProps,
} from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type AppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalProps['size'];
};

/** Shared admin modal — full-screen on mobile, sized dialog on desktop. */
export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}: AppModalProps) {
  const resolvedSize =
    useBreakpointValue({
      base: 'full' as const,
      md: size,
    }) ?? size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={resolvedSize}
      isCentered
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      preserveScrollBarGap
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
      <ModalContent
        borderRadius={{ base: 0, md: '22px' }}
        containerProps={{
          p: { base: 0, md: 4 },
        }}
        m={0}
        mx={{ base: 0, md: '16px' }}
        h={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: '90vh' }}
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {title ? (
          <ModalHeader
            fontSize={{ base: '17px', md: '18px' }}
            fontWeight={800}
            letterSpacing="-0.02em"
            pr="48px"
            borderBottom="1px solid"
            borderColor="line.500"
            flexShrink={0}
          >
            {title}
          </ModalHeader>
        ) : null}
        <ModalCloseButton top="14px" right="14px" borderRadius="10px" />
        <ModalBody
          px={{ base: '16px', md: '22px' }}
          py={{ base: '16px', md: '20px' }}
          flex="1"
          overflowY="auto"
        >
          {children}
        </ModalBody>
        {footer ? (
          <ModalFooter
            borderTop="1px solid"
            borderColor="line.500"
            gap="8px"
            justifyContent="flex-start"
            flexShrink={0}
          >
            {footer}
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}
