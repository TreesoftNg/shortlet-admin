'use client';

import { Button, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { AppModal } from './app-modal';

export type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  /** Destructive actions (delete / archive) use a danger confirm button. */
  tone?: 'danger' | 'default';
};

/** Confirm / cancel dialog for deletes and other irreversible actions. */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
  tone = 'danger',
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => {
        if (isLoading) return;
        onClose();
      }}
      title={title}
      size="md"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            isDisabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            {...(tone === 'danger'
              ? {
                  bg: 'status.danger',
                  color: 'white',
                  _hover: { opacity: 0.9 },
                }
              : {})}
            onClick={() => void handleConfirm()}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description ? (
        typeof description === 'string' ? (
          <Text fontSize="14px" color="ink.400" lineHeight="1.5">
            {description}
          </Text>
        ) : (
          description
        )
      ) : null}
    </AppModal>
  );
}
