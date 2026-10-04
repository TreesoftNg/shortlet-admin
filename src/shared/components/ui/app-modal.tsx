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
  /** Overrides Chakra’s named size when a wider inventory dialog is needed. */
  maxWidth?: string;
};

/** Shared admin modal — full-screen on mobile, sized dialog on desktop. */
export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
  maxWidth,
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
          p: { base: 0, md: 6 },
        }}
        m={0}
        mx={{ base: 0, md: '24px' }}
        w="100%"
        {...(maxWidth ? { maxW: { base: '100%', md: maxWidth } } : {})}
        h={{ base: '100dvh', md: 'auto' }}
        maxH={{ base: '100dvh', md: '92vh' }}
        overflow="hidden"
        display="flex"
        flexDirection="column"
      >
        {title ? (
          <ModalHeader
            fontSize={{ base: '18px', md: '20px' }}
            fontWeight={800}
            letterSpacing="-0.02em"
            px={{ base: '16px', md: '28px' }}
            py={{ base: '16px', md: '18px' }}
            pr="56px"
            borderBottom="1px solid"
            borderColor="line.500"
            flexShrink={0}
          >
            {title}
          </ModalHeader>
        ) : null}
        <ModalCloseButton top="16px" right="16px" borderRadius="10px" />
        <ModalBody
          px={{ base: '16px', md: '28px' }}
          py={{ base: '16px', md: '24px' }}
          flex="1"
          overflowY="auto"
        >
          {children}
        </ModalBody>
        {footer ? (
          <ModalFooter
            borderTop="1px solid"
            borderColor="line.500"
            gap="10px"
            justifyContent="flex-start"
            flexShrink={0}
            px={{ base: '16px', md: '28px' }}
            py={{ base: '14px', md: '16px' }}
          >
            {footer}
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}
