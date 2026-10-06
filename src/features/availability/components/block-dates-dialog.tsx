'use client';

import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  BLOCK_REASON_LABELS,
  describeBlockApiError,
  validateBlockInput,
} from '@/features/calendar-sync/utils/calendar-sync-format';
import type { BlockReason } from '@/features/calendar-sync/types';
import { AppModal } from '@/shared/components/ui';
import { useBlockNights } from '../hooks/use-availability-actions';
import type { CalendarUnitRow, NightSelection } from '../types';

type BlockDatesDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  units: CalendarUnitRow[];
  today: string;
  /** Pre-filled from nights picked on the grid. */
  initial?: NightSelection | null;
  onBlocked?: () => void;
};

const REASONS = Object.keys(BLOCK_REASON_LABELS) as BlockReason[];

/** Takes nights off sale on a unit; Hospitable closes them on Airbnb too. */
export function BlockDatesDialog({ isOpen, onClose, units, today, initial, onBlocked }: BlockDatesDialogProps) {
  const toast = useToast();
  const block = useBlockNights();
  const [unitId, setUnitId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState<BlockReason>('maintenance');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setUnitId(initial?.unitId ?? units[0]?.id ?? '');
    setStartDate(initial?.startDate ?? '');
    setEndDate(initial?.endDate ?? '');
    setReason('maintenance');
    setNote('');
    setSubmitted(false);
    block.reset();
    // Reset only when the dialog opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const errors = validateBlockInput({ startDate, endDate, reason }, today);
  const hasErrors = Object.keys(errors).length > 0;

  const submit = async () => {
    setSubmitted(true);
    if (hasErrors || !unitId) return;
    try {
      await block.mutateAsync({
        unitId,
        input: { startDate, endDate, reason, ...(note.trim() ? { note: note.trim() } : {}) },
      });
      toast({ status: 'success', title: 'Nights blocked' });
      onBlocked?.();
      onClose();
    } catch {
      // Shown below from block.error.
    }
  };

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title="Block dates"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} isLoading={block.isPending}>
            Block nights
          </Button>
        </>
      }
    >
      <FormControl mb="14px">
        <FormLabel>Unit</FormLabel>
        <Select aria-label="Unit" value={unitId} onChange={(event) => setUnitId(event.target.value)}>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.propertyName ? `${unit.propertyName} · ${unit.name}` : unit.name}
            </option>
          ))}
        </Select>
      </FormControl>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px" mb="14px">
        <FormControl isInvalid={submitted && Boolean(errors.startDate)}>
          <FormLabel>First night</FormLabel>
          <Input type="date" aria-label="First night" min={today} value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <FormErrorMessage>{errors.startDate}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={submitted && Boolean(errors.endDate)}>
          <FormLabel>Checkout day</FormLabel>
          <Input type="date" aria-label="Checkout day" min={startDate || today} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <FormErrorMessage>{errors.endDate}</FormErrorMessage>
        </FormControl>
      </SimpleGrid>
      <FormControl mb="14px">
        <FormLabel>Reason</FormLabel>
        <Select aria-label="Reason" value={reason} onChange={(event) => setReason(event.target.value as BlockReason)}>
          {REASONS.map((value) => (
            <option key={value} value={value}>
              {BLOCK_REASON_LABELS[value]}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel>Note (staff only)</FormLabel>
        <Textarea aria-label="Note" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
      </FormControl>
      {block.error ? (
        <Text mt="12px" color="status.danger" fontSize="14px" role="alert">
          {describeBlockApiError(block.error)}
        </Text>
      ) : null}
    </AppModal>
  );
}
