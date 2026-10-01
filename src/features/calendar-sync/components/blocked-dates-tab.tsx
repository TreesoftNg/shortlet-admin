'use client';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { EmptyState, ErrorState } from '@/shared/components/ui';
import { useCreateBlock, useDeleteBlock } from '../hooks/use-calendar-sync-mutations';
import { useBlocks } from '../hooks/use-calendar-sync-queries';
import type { AvailabilityBlock, BlockReason, CreateBlockInput, UnitCalendarSummary } from '../types';
import {
  BLOCK_REASON_LABELS,
  errorMessage,
  formatStayDate,
  todayIsoDate,
  validateBlockInput,
} from '../utils/calendar-sync-format';

const EMPTY_FORM: CreateBlockInput = { startDate: '', endDate: '', reason: 'maintenance', note: '' };

const inputProps = { borderColor: 'line.500', borderRadius: '12px', bg: 'white' } as const;

/** Nights taken off sale here; sent to Hospitable through the export link. */
export function BlockedDatesTab({ unit }: { unit: UnitCalendarSummary }) {
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'availability.manage');
  const blocks = useBlocks(unit.unitId);

  return (
    <Stack spacing="20px" fontSize="14px">
      <Text color="ink.400">
        Take nights off sale for maintenance or owner stays. Hospitable closes the same nights on Airbnb and
        Booking.com once the export link is set up.
      </Text>
      {canManage ? <NewBlockForm unit={unit} /> : null}

      <Box>
        <Text fontWeight={700} mb="10px">
          Current and upcoming blocks
        </Text>
        {blocks.isPending ? (
          <Flex justify="center" py="24px">
            <Spinner color="brand.500" />
          </Flex>
        ) : blocks.isError ? (
          <ErrorState minH="160px" message={errorMessage(blocks.error)} onRetry={() => void blocks.refetch()} />
        ) : blocks.data.length === 0 ? (
          <EmptyState minH="140px" title="No blocked dates" description="Blocks you add appear here." />
        ) : (
          <Stack spacing="8px">
            {blocks.data.map((block) => (
              <BlockRow key={block.id} unitId={unit.unitId} block={block} canDelete={canManage} />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function NewBlockForm({ unit }: { unit: UnitCalendarSummary }) {
  const toast = useToast();
  const create = useCreateBlock(unit.unitId);
  const [form, setForm] = useState<CreateBlockInput>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const today = todayIsoDate(unit.timezone);
  const errors = submitted ? validateBlockInput(form, today) : {};
  const update = (patch: Partial<CreateBlockInput>) => setForm((current) => ({ ...current, ...patch }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateBlockInput(form, today)).length) return;
    create.mutate(
      { ...form, note: form.note?.trim() || undefined },
      {
        onSuccess: (block) => {
          toast({
            status: 'success',
            title: 'Dates blocked',
            description: `${block.nights} night(s) from ${formatStayDate(block.startDate)}.`,
          });
          setForm(EMPTY_FORM);
          setSubmitted(false);
        },
      },
    );
  };

  return (
    <Box as="form" onSubmit={submit} noValidate border="1px solid" borderColor="line.500" borderRadius="14px" p="16px">
      <Text fontWeight={700} mb="12px">
        Block new dates
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="12px">
        <FormControl isInvalid={Boolean(errors.startDate)} isRequired>
          <FormLabel fontSize="13px">First night</FormLabel>
          <Input
            type="date"
            min={today}
            value={form.startDate}
            onChange={(event) => update({ startDate: event.target.value })}
            {...inputProps}
          />
          <FormErrorMessage>{errors.startDate}</FormErrorMessage>
        </FormControl>
        <FormControl isInvalid={Boolean(errors.endDate)} isRequired>
          <FormLabel fontSize="13px">Checkout day</FormLabel>
          <Input
            type="date"
            min={form.startDate || today}
            value={form.endDate}
            onChange={(event) => update({ endDate: event.target.value })}
            {...inputProps}
          />
          <FormErrorMessage>{errors.endDate}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="13px">Reason</FormLabel>
          <Select
            value={form.reason}
            onChange={(event) => update({ reason: event.target.value as BlockReason })}
            {...inputProps}
          >
            {Object.entries(BLOCK_REASON_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="13px">Note (internal only)</FormLabel>
          <Input
            value={form.note}
            maxLength={500}
            placeholder="e.g. AC service"
            onChange={(event) => update({ note: event.target.value })}
            {...inputProps}
          />
        </FormControl>
      </SimpleGrid>
      {create.isError ? (
        <Alert status="error" borderRadius="12px" mt="12px">
          <AlertIcon />
          <AlertDescription>{errorMessage(create.error)}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" mt="14px" isLoading={create.isPending}>
        Block dates
      </Button>
    </Box>
  );
}

function BlockRow({ unitId, block, canDelete }: { unitId: string; block: AvailabilityBlock; canDelete: boolean }) {
  const toast = useToast();
  const remove = useDeleteBlock(unitId);

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="12px"
      border="1px solid"
      borderColor="line.500"
      borderRadius="12px"
      p="12px 14px"
    >
      <Box minW={0}>
        <Text fontWeight={700}>
          {formatStayDate(block.startDate)} → {formatStayDate(block.endDate)}
        </Text>
        <Text fontSize="13px" color="ink.400">
          {block.nights} night{block.nights === 1 ? '' : 's'} · {BLOCK_REASON_LABELS[block.reason]}
          {block.note ? ` · ${block.note}` : ''}
        </Text>
      </Box>
      {canDelete ? (
        <IconButton
          aria-label={`Remove block starting ${block.startDate}`}
          icon={<LuTrash2 size={16} />}
          size="sm"
          isLoading={remove.isPending}
          onClick={() =>
            remove.mutate(block.id, {
              onError: (error) =>
                toast({ status: 'error', title: 'Could not remove block', description: errorMessage(error) }),
            })
          }
        />
      ) : null}
    </Flex>
  );
}
