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
  Input,
  ListItem,
  OrderedList,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useState, type FormEvent } from 'react';
import { KeyValueList, StatusBadge } from '@/shared/components/ui';
import {
  useConnectImportFeed,
  useDisconnectImportFeed,
  useSyncImportFeed,
} from '../hooks/use-calendar-sync-mutations';
import type { UnitCalendarSummary } from '../types';
import {
  describeCalendarApiError,
  describeIcalUrlIssue,
  describeImportGuidance,
  describeImportHealth,
  describeSyncResult,
  formatNextSync,
  formatRelativeTime,
  icalUrlIssueMessage,
  looksLikeHospitableIcalUrl,
  normalizeIcalUrl,
  syncToastStatus,
} from '../utils/calendar-sync-format';

export function ImportTab({ unit }: { unit: UnitCalendarSummary }) {
  const [replacing, setReplacing] = useState(false);
  const { feed } = unit;

  if (!feed || replacing) {
    return (
      <ConnectFeedForm
        unit={unit}
        isReplacing={Boolean(feed)}
        onDone={() => setReplacing(false)}
      />
    );
  }

  return <FeedStatus unit={unit} onReplace={() => setReplacing(true)} />;
}

function FeedStatus({ unit, onReplace }: { unit: UnitCalendarSummary; onReplace: () => void }) {
  const toast = useToast();
  const sync = useSyncImportFeed(unit.unitId);
  const disconnect = useDisconnectImportFeed(unit.unitId);
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const feed = unit.feed!;
  const health = describeImportHealth(feed);
  const guidance = describeImportGuidance(feed);

  const syncNow = () => {
    setSyncError(null);
    sync.mutate(undefined, {
      onSuccess: (result) => {
        if (result.outcome === 'failed') {
          setSyncError(describeSyncResult(result));
        }
        toast({
          status: syncToastStatus(result.outcome),
          title:
            result.outcome === 'failed'
              ? 'Sync failed'
              : result.outcome === 'locked'
                ? 'Sync already running'
                : result.outcome === 'awaiting_confirmation'
                  ? 'Empty feed — confirming'
                  : 'Calendar synced',
          description: describeSyncResult(result),
        });
      },
      onError: (error) => {
        const message = describeCalendarApiError(error);
        setSyncError(message);
        toast({
          status: 'error',
          title: 'Sync failed',
          description: message,
        });
      },
    });
  };

  const disconnectFeed = () =>
    disconnect.mutate(undefined, {
      onSuccess: ({ releasedEvents }) =>
        toast({
          status: 'success',
          title: 'Import disconnected',
          description: `${releasedEvents} upcoming booking(s) no longer block this unit.`,
        }),
      onError: (error) =>
        toast({
          status: 'error',
          title: 'Could not disconnect',
          description: describeCalendarApiError(error),
        }),
    });

  return (
    <Stack spacing="16px" fontSize="14px">
      <KeyValueList
        items={[
          { label: 'Status', value: <StatusBadge tone={health.tone}>{health.label}</StatusBadge> },
          { label: 'Source', value: feed.host },
          { label: 'Last synced', value: formatRelativeTime(feed.lastSucceededAt) },
          { label: 'Next sync', value: formatNextSync(feed.nextFetchAt) },
          { label: 'Upcoming bookings', value: String(feed.upcomingEventCount) },
          ...(feed.consecutiveFailures > 0
            ? [
                {
                  label: 'Failed attempts',
                  value: String(feed.consecutiveFailures),
                },
              ]
            : []),
        ]}
      />

      {guidance ? (
        <Alert status={guidance.tone} borderRadius="12px" alignItems="flex-start">
          <AlertIcon mt="2px" />
          <Box>
            <AlertTitle fontSize="14px" mb="4px">
              {guidance.title}
            </AlertTitle>
            <AlertDescription>{guidance.body}</AlertDescription>
          </Box>
        </Alert>
      ) : null}

      {syncError ? (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <AlertDescription>{syncError}</AlertDescription>
        </Alert>
      ) : null}

      {confirmingDisconnect ? (
        <Alert status="warning" borderRadius="12px" alignItems="flex-start">
          <AlertIcon mt="2px" />
          <Stack spacing="10px">
            <AlertDescription>
              Stop importing from Hospitable? Upcoming Hospitable bookings will no longer block this unit.
            </AlertDescription>
            <Flex gap="8px">
              <Button
                size="sm"
                bg="status.danger"
                _hover={{ opacity: 0.9 }}
                onClick={disconnectFeed}
                isLoading={disconnect.isPending}
              >
                Disconnect
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setConfirmingDisconnect(false)}>
                Keep it
              </Button>
            </Flex>
          </Stack>
        </Alert>
      ) : (
        <Flex gap="8px" wrap="wrap">
          <Button onClick={syncNow} isLoading={sync.isPending}>
            Sync now
          </Button>
          <Button variant="secondary" onClick={onReplace}>
            Replace link
          </Button>
          <Button variant="secondary" color="status.danger" onClick={() => setConfirmingDisconnect(true)}>
            Disconnect
          </Button>
        </Flex>
      )}
    </Stack>
  );
}

function ConnectFeedForm({
  unit,
  isReplacing,
  onDone,
}: {
  unit: UnitCalendarSummary;
  isReplacing: boolean;
  onDone: () => void;
}) {
  const toast = useToast();
  const connect = useConnectImportFeed(unit.unitId);
  const [url, setUrl] = useState('');
  const [touched, setTouched] = useState(false);
  const issue = touched ? describeIcalUrlIssue(url) : null;
  const formatError = issue ? icalUrlIssueMessage(issue) : undefined;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    const cleaned = normalizeIcalUrl(url);
    if (!looksLikeHospitableIcalUrl(cleaned)) return;
    connect.mutate(cleaned, {
      onSuccess: ({ sync }) => {
        toast({
          status: syncToastStatus(sync.outcome),
          title:
            sync.outcome === 'failed'
              ? 'Connected, but sync failed'
              : sync.outcome === 'awaiting_confirmation'
                ? 'Connected — confirming empty feed'
                : 'Calendar connected',
          description: describeSyncResult(sync),
        });
        setUrl('');
        onDone();
      },
    });
  };

  return (
    <Stack as="form" spacing="16px" fontSize="14px" onSubmit={submit} noValidate>
      <Box bg="bg.400" borderRadius="12px" p="14px 16px">
        <Text fontWeight={700} mb="6px">
          Find the link in Hospitable
        </Text>
        <OrderedList spacing="4px" color="ink.400" pl="4px">
          <ListItem>
            Open <b>Properties</b> and choose <b>{unit.name}</b>.
          </ListItem>
          <ListItem>
            Go to the calendar settings and copy the <b>Property iCal</b> export link.
          </ListItem>
          <ListItem>
            Paste it below. It must include <b>key</b> and <b>token</b>. Treat it like a password.
          </ListItem>
        </OrderedList>
      </Box>

      <FormControl isInvalid={Boolean(formatError)} isRequired>
        <FormLabel fontSize="13px">Hospitable iCal link</FormLabel>
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onBlur={() => setTouched(true)}
          onPaste={(event) => {
            const pasted = event.clipboardData.getData('text');
            if (!pasted) return;
            event.preventDefault();
            setUrl(normalizeIcalUrl(pasted));
            setTouched(true);
          }}
          placeholder="https://api.hospitable.com/v1/properties/reservations.ics?…"
          autoComplete="off"
          spellCheck={false}
          fontFamily="mono"
          fontSize="13px"
          borderColor="line.500"
          borderRadius="12px"
        />
        {formatError ? (
          <FormErrorMessage>{formatError}</FormErrorMessage>
        ) : (
          <FormHelperText>
            We validate the link, store it encrypted, and import bookings straight away.
          </FormHelperText>
        )}
      </FormControl>

      {connect.isError ? (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <AlertDescription>{describeCalendarApiError(connect.error)}</AlertDescription>
        </Alert>
      ) : null}

      <Flex gap="8px">
        <Button type="submit" isLoading={connect.isPending}>
          {isReplacing ? 'Replace link' : 'Connect'}
        </Button>
        {isReplacing ? (
          <Button variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        ) : null}
      </Flex>
    </Stack>
  );
}
