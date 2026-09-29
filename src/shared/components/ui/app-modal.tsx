'use client';

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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

/** Shared admin modal — used for row-detail views across list pages. */
export function AppModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}: AppModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      isCentered
      scrollBehavior="inside"
      motionPreset="slideInBottom"
      preserveScrollBarGap
    >
      <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(2px)" />
      <ModalContent borderRadius="22px" mx="16px" maxH="90vh" overflow="hidden">
        {title ? (
          <ModalHeader
            fontSize="18px"
            fontWeight={800}
            letterSpacing="-0.02em"
            pr="48px"
            borderBottom="1px solid"
            borderColor="line.500"
          >
            {title}
          </ModalHeader>
        ) : null}
        <ModalCloseButton top="14px" right="14px" borderRadius="10px" />
        <ModalBody px="22px" py="20px">
          {children}
        </ModalBody>
        {footer ? (
          <ModalFooter
            borderTop="1px solid"
            borderColor="line.500"
            gap="8px"
            justifyContent="flex-start"
          >
            {footer}
          </ModalFooter>
        ) : null}
      </ModalContent>
    </Modal>
  );
}
