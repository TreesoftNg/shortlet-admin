'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useId, useState } from 'react';
import { BlockReasonPicker } from '@/features/calendar-sync/components/block-reason-picker';
import type { BlockReason } from '@/features/calendar-sync/types';
import {
  countNights,
  describeBlockApiError,
  formatStayDate,
  validateBlockInput,
} from '@/features/calendar-sync/utils/calendar-sync-format';
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

const inputProps = { borderColor: 'line.500', borderRadius: '10px', bg: 'white', h: '40px', fontSize: '14px' } as const;
const labelProps = { fontSize: '13px', fontWeight: 600, color: 'ink.500' } as const;

/** Takes nights off sale on a unit; Hospitable closes them on Airbnb too. */
export function BlockDatesDialog({ isOpen, onClose, units, today, initial, onBlocked }: BlockDatesDialogProps) {
  const toast = useToast();
  const block = useBlockNights();
  const reasonLabelId = useId();
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
  const nights = startDate && endDate && endDate > startDate ? countNights(startDate, endDate) : 0;

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
      size="2xl"
      footer={
        <Flex
          w="100%"
          gap="12px"
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          direction={{ base: 'column', md: 'row' }}
        >
          <Text fontSize="13px" color="ink.400">
            {nights > 0 ? (
              <>
                <Text as="span" fontWeight={700} color="ink.500">
                  {nights} night{nights === 1 ? '' : 's'} blocked
                </Text>{' '}
                · {formatStayDate(startDate)} → {formatStayDate(endDate)}
              </>
            ) : (
              'Pick the first night and the checkout day.'
            )}
          </Text>
          <Flex gap="8px">
            <Button variant="secondary" h="40px" borderRadius="10px" onClick={onClose} flex={{ base: 1, md: 'none' }}>
              Cancel
            </Button>
            <Button
              h="40px"
              px="18px"
              borderRadius="10px"
              onClick={() => void submit()}
              isLoading={block.isPending}
              flex={{ base: 1, md: 'none' }}
            >
              Block nights
            </Button>
          </Flex>
        </Flex>
      }
    >
      <Stack spacing="18px">
        <Text fontSize="14px" color="ink.400">
          Guests can&apos;t book these nights. Hospitable closes them on Airbnb and Booking.com too.
        </Text>
        <FormControl>
          <FormLabel {...labelProps}>Unit</FormLabel>
          <Select aria-label="Unit" value={unitId} onChange={(event) => setUnitId(event.target.value)} {...inputProps}>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.propertyName ? `${unit.propertyName} · ${unit.name}` : unit.name}
              </option>
            ))}
          </Select>
        </FormControl>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="14px">
          <FormControl isInvalid={submitted && Boolean(errors.startDate)}>
            <FormLabel {...labelProps}>First night</FormLabel>
            <Input
              type="date"
              aria-label="First night"
              min={today}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              {...inputProps}
            />
            <FormErrorMessage>{errors.startDate}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={submitted && Boolean(errors.endDate)}>
            <FormLabel {...labelProps}>Checkout day</FormLabel>
            <Input
              type="date"
              aria-label="Checkout day"
              min={startDate || today}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              {...inputProps}
            />
            <FormErrorMessage>{errors.endDate}</FormErrorMessage>
          </FormControl>
        </SimpleGrid>
        <Box>
          <Text id={reasonLabelId} {...labelProps} mb="8px">
            Reason
          </Text>
          <BlockReasonPicker labelledBy={reasonLabelId} value={reason} onChange={setReason} />
        </Box>
        <FormControl>
          <FormLabel {...labelProps}>
            Note{' '}
            <Text as="span" fontWeight={500} color="ink.300">
              (optional, staff only)
            </Text>
          </FormLabel>
          <Textarea
            aria-label="Note"
            maxLength={500}
            placeholder="e.g. Deep clean and AC service"
            minH="76px"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            borderColor="line.500"
            borderRadius="10px"
            fontSize="14px"
          />
          <FormHelperText textAlign="right" fontSize="12px" color="ink.300">
            {note.length}/500
          </FormHelperText>
        </FormControl>
        {block.error ? (
          <Text color="status.danger" fontSize="14px" role="alert">
            {describeBlockApiError(block.error)}
          </Text>
        ) : null}
      </Stack>
    </AppModal>
  );
}
