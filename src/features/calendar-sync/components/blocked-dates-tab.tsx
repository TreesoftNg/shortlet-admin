'use client';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useId, useMemo, useState, type FormEvent } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { ErrorState, FormPanel, FormPanelBody, StatusBadge } from '@/shared/components/ui';
import { useCreateBlock, useDeleteBlock } from '../hooks/use-calendar-sync-mutations';
import { useBlocks } from '../hooks/use-calendar-sync-queries';
import { BlockReasonPicker } from './block-reason-picker';
import type { AvailabilityBlock, BlockReason, CreateBlockInput, UnitCalendarSummary } from '../types';
import {
  BLOCK_REASON_LABELS,
  BLOCK_REASON_TONES,
  addDaysIso,
  countNights,
  describeBlockApiError,
  errorMessage,
  findOverlappingBlocks,
  formatStayDate,
  sortAvailabilityBlocks,
  todayIsoDate,
  validateBlockInput,
} from '../utils/calendar-sync-format';

const EMPTY_FORM: CreateBlockInput = { startDate: '', endDate: '', reason: 'maintenance', note: '' };

const inputProps = { borderColor: 'line.500', borderRadius: '10px', bg: 'white' } as const;
const labelProps = { fontSize: '13px', fontWeight: 600, color: 'ink.500' } as const;

/** Nights taken off sale here; sent to Hospitable through the export link. */
export function BlockedDatesTab({ unit }: { unit: UnitCalendarSummary }) {
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'availability.manage');
  const blocks = useBlocks(unit.unitId);
  const sortedBlocks = useMemo(
    () => sortAvailabilityBlocks(blocks.data ?? []),
    [blocks.data],
  );

  return (
    <Stack spacing="20px" fontSize="14px">
      <Text color="ink.400">
        Take nights off sale for maintenance or owner stays. Hospitable closes the same nights on Airbnb and
        Booking.com once the export link is set up.
      </Text>
      {canManage ? (
        <NewBlockForm unit={unit} existingBlocks={sortedBlocks} />
      ) : null}

      <Box>
        <Flex justify="space-between" align="baseline" gap="12px" mb="10px" wrap="wrap">
          <Text fontWeight={700}>Current and upcoming blocks</Text>
          {!blocks.isPending && !blocks.isError ? (
            <Text fontSize="13px" color="ink.300">
              {sortedBlocks.length} block{sortedBlocks.length === 1 ? '' : 's'}
            </Text>
          ) : null}
        </Flex>
        {blocks.isPending ? (
          <Flex justify="center" py="24px">
            <Spinner color="brand.500" />
          </Flex>
        ) : blocks.isError ? (
          <ErrorState minH="160px" message={errorMessage(blocks.error)} onRetry={() => void blocks.refetch()} />
        ) : sortedBlocks.length === 0 ? (
          <Box
            border="1px dashed"
            borderColor="line.500"
            borderRadius="12px"
            py="18px"
            px="16px"
            textAlign="center"
            fontSize="13px"
            color="ink.300"
          >
            No blocked dates. Blocks you add appear here.
          </Box>
        ) : (
          <Stack spacing="8px">
            {sortedBlocks.map((block) => (
              <BlockRow key={block.id} unitId={unit.unitId} block={block} canDelete={canManage} />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function NewBlockForm({
  unit,
  existingBlocks,
}: {
  unit: UnitCalendarSummary;
  existingBlocks: AvailabilityBlock[];
}) {
  const toast = useToast();
  const create = useCreateBlock(unit.unitId);
  const [form, setForm] = useState<CreateBlockInput>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);
  const today = todayIsoDate(unit.timezone);
  const errors = submitted ? validateBlockInput(form, today) : {};
  const nights =
    form.startDate && form.endDate && form.endDate > form.startDate
      ? countNights(form.startDate, form.endDate)
      : 0;
  const overlaps = useMemo(
    () => findOverlappingBlocks(form, existingBlocks),
    [existingBlocks, form],
  );

  const update = (patch: Partial<CreateBlockInput>) => {
    setForm((current) => {
      const next = { ...current, ...patch };
      if (
        patch.startDate &&
        (!next.endDate || next.endDate <= patch.startDate)
      ) {
        next.endDate = addDaysIso(patch.startDate, 1);
      }
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(validateBlockInput(form, today)).length) return;
    if (overlaps.length > 0) return;
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

  const noteLength = form.note?.length ?? 0;
  const reasonLabelId = useId();

  return (
    <Box as="form" onSubmit={submit} noValidate>
      <FormPanel
        title="Block new dates"
        footer={
          <>
            <Text fontSize="13px" color="ink.400" alignSelf={{ base: 'flex-start', md: 'center' }}>
              {nights > 0 ? (
                <>
                  <Text as="span" fontWeight={700} color="ink.500">
                    {nights} night{nights === 1 ? '' : 's'} blocked
                  </Text>{' '}
                  · {formatStayDate(form.startDate)} → {formatStayDate(form.endDate)}
                </>
              ) : (
                'Pick the first night and the checkout day.'
              )}
            </Text>
            <Button
              type="submit"
              h="40px"
              px="18px"
              borderRadius="10px"
              w={{ base: '100%', md: 'auto' }}
              isLoading={create.isPending}
              isDisabled={overlaps.length > 0}
            >
              Block dates
            </Button>
          </>
        }
      >
        <FormPanelBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="14px">
            <FormControl isInvalid={Boolean(errors.startDate)} isRequired>
              <FormLabel {...labelProps}>First night</FormLabel>
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
              <FormLabel {...labelProps}>Checkout day</FormLabel>
              <Input
                type="date"
                min={form.startDate ? addDaysIso(form.startDate, 1) : today}
                value={form.endDate}
                onChange={(event) => update({ endDate: event.target.value })}
                {...inputProps}
              />
              <FormErrorMessage>{errors.endDate}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <Box>
            <Text id={reasonLabelId} {...labelProps} mb="8px">
              Reason
            </Text>
            <BlockReasonPicker
              labelledBy={reasonLabelId}
              value={form.reason}
              onChange={(reason) => update({ reason })}
            />
          </Box>

          <FormControl>
            <FormLabel {...labelProps}>
              Note{' '}
              <Text as="span" fontWeight={500} color="ink.300">
                (optional, staff only)
              </Text>
            </FormLabel>
            <Textarea
              value={form.note}
              maxLength={500}
              placeholder="e.g. Deep clean and AC service"
              minH="76px"
              onChange={(event) => update({ note: event.target.value })}
              {...inputProps}
            />
            <FormHelperText textAlign="right" fontSize="12px" color="ink.300">
              {noteLength}/500
            </FormHelperText>
          </FormControl>

          {overlaps.length > 0 ? (
            <Alert status="warning" borderRadius="12px" alignItems="flex-start">
              <AlertIcon mt="2px" />
              <Box>
                <AlertTitle fontSize="14px" mb="4px">
                  Overlaps an existing block
                </AlertTitle>
                <AlertDescription>
                  Conflicts with{' '}
                  {overlaps
                    .slice(0, 2)
                    .map(
                      (block) =>
                        `${formatStayDate(block.startDate)} → ${formatStayDate(block.endDate)}`,
                    )
                    .join('; ')}
                  {overlaps.length > 2 ? ` and ${overlaps.length - 2} more` : ''}. Adjust the range
                  before saving.
                </AlertDescription>
              </Box>
            </Alert>
          ) : null}

          {create.isError ? (
            <Alert status="error" borderRadius="12px">
              <AlertIcon />
              <AlertDescription>{describeBlockApiError(create.error)}</AlertDescription>
            </Alert>
          ) : null}
        </FormPanelBody>
      </FormPanel>
    </Box>
  );
}

function BlockRow({
  unitId,
  block,
  canDelete,
}: {
  unitId: string;
  block: AvailabilityBlock;
  canDelete: boolean;
}) {
  const toast = useToast();
  const remove = useDeleteBlock(unitId);
  const [confirming, setConfirming] = useState(false);

  const removeBlock = () =>
    remove.mutate(block.id, {
      onSuccess: () => {
        toast({
          status: 'success',
          title: 'Block removed',
          description: `${formatStayDate(block.startDate)} → ${formatStayDate(block.endDate)} is open again.`,
        });
        setConfirming(false);
      },
      onError: (error) =>
        toast({
          status: 'error',
          title: 'Could not remove block',
          description: describeBlockApiError(error),
        }),
    });

  return (
    <Box border="1px solid" borderColor="line.500" borderRadius="12px" p="12px 14px">
      <Flex align="flex-start" justify="space-between" gap="12px">
        <Box minW={0}>
          <Text fontWeight={700}>
            {formatStayDate(block.startDate)} → {formatStayDate(block.endDate)}
          </Text>
          <Flex mt="6px" gap="6px" wrap="wrap" align="center">
            <StatusBadge tone={BLOCK_REASON_TONES[block.reason]}>
              {BLOCK_REASON_LABELS[block.reason]}
            </StatusBadge>
            <Text fontSize="13px" color="ink.400">
              {block.nights} night{block.nights === 1 ? '' : 's'}
            </Text>
          </Flex>
          {block.note ? (
            <Text fontSize="13px" color="ink.300" mt="6px">
              {block.note}
            </Text>
          ) : null}
        </Box>
        {canDelete && !confirming ? (
          <IconButton
            aria-label={`Remove block starting ${block.startDate}`}
            icon={<LuTrash2 size={16} />}
            size="sm"
            variant="secondary"
            onClick={() => setConfirming(true)}
          />
        ) : null}
      </Flex>

      {confirming ? (
        <Alert status="warning" borderRadius="12px" mt="10px" alignItems="flex-start">
          <AlertIcon mt="2px" />
          <Stack spacing="10px">
            <AlertDescription>
              Reopen these nights? Hospitable will follow once the export feed updates.
            </AlertDescription>
            <Flex gap="8px">
              <Button
                size="sm"
                bg="status.danger"
                _hover={{ opacity: 0.9 }}
                onClick={removeBlock}
                isLoading={remove.isPending}
              >
                Remove block
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </Flex>
          </Stack>
        </Alert>
      ) : null}
    </Box>
  );
}
