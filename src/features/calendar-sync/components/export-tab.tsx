'use client';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  ListItem,
  OrderedList,
  Spinner,
  Stack,
  Text,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ErrorState, KeyValueList, StatusBadge } from '@/shared/components/ui';
import { useIssueExportFeed, useRevokeExportFeed } from '../hooks/use-calendar-sync-mutations';
import { useExportFeed } from '../hooks/use-calendar-sync-queries';
import type { UnitCalendarSummary } from '../types';
import { describeExportHealth, errorMessage, formatRelativeTime, isReachableByHospitable } from '../utils/calendar-sync-format';

/** The secret iCal link Hospitable imports to close Sunmade's blocked nights. */
export function ExportTab({ unit }: { unit: UnitCalendarSummary }) {
  const toast = useToast();
  const exportFeed = useExportFeed(unit.unitId);
  const issue = useIssueExportFeed(unit.unitId);
  const revoke = useRevokeExportFeed(unit.unitId);
  // Shown once, straight after creation; the API only stores its hash.
  const [issuedUrl, setIssuedUrl] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'regenerate' | 'disable' | null>(null);

  const createLink = () =>
    issue.mutate(undefined, {
      onSuccess: ({ url }) => {
        setIssuedUrl(url);
        setConfirm(null);
      },
    });

  const disableLink = () =>
    revoke.mutate(undefined, {
      onSuccess: () => {
        setConfirm(null);
        setIssuedUrl(null);
        toast({ status: 'success', title: 'Export link disabled', description: 'Remove it from Hospitable too.' });
      },
    });

  if (exportFeed.isPending) {
    return (
      <Flex justify="center" py="32px">
        <Spinner color="brand.500" />
      </Flex>
    );
  }
  if (exportFeed.isError) {
    return <ErrorState minH="180px" message={errorMessage(exportFeed.error)} onRetry={() => void exportFeed.refetch()} />;
  }

  const current = exportFeed.data;
  const health = describeExportHealth(current);
  const mutationError = issue.error ?? revoke.error;

  return (
    <Stack spacing="18px" fontSize="14px">
      <Text color="ink.400">
        Sends this unit&apos;s blocked dates to Hospitable, which closes the same nights on Airbnb and Booking.com.
        Guests&apos; details are never included.
      </Text>

      {issuedUrl ? (
        <IssuedLink url={issuedUrl} unitName={unit.name} />
      ) : current ? (
        <Stack spacing="14px">
          <KeyValueList
            items={[
              { label: 'Status', value: <StatusBadge tone={health.tone}>{health.label}</StatusBadge> },
              { label: 'Link created', value: formatRelativeTime(current.issuedAt) },
              { label: 'Last fetched by Hospitable', value: formatRelativeTime(current.lastAccessedAt) },
            ]}
          />
          <Text color="ink.300" fontSize="13px">
            The link is only shown when it is created. Lost it? Get a new link and replace it in Hospitable.
          </Text>
        </Stack>
      ) : null}

      {confirm ? (
        <Alert status="warning" borderRadius="12px" alignItems="flex-start">
          <AlertIcon mt="2px" />
          <Stack spacing="10px">
            <AlertDescription>
              {confirm === 'regenerate'
                ? 'The current link stops working immediately. You will need to replace it in Hospitable.'
                : 'Hospitable will stop receiving blocked dates for this unit.'}
            </AlertDescription>
            <Flex gap="8px">
              {confirm === 'regenerate' ? (
                <Button size="sm" onClick={createLink} isLoading={issue.isPending}>
                  Get a new link
                </Button>
              ) : (
                <Button size="sm" bg="status.danger" _hover={{ opacity: 0.9 }} onClick={disableLink} isLoading={revoke.isPending}>
                  Disable link
                </Button>
              )}
              <Button size="sm" variant="secondary" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
            </Flex>
          </Stack>
        </Alert>
      ) : current || issuedUrl ? (
        <Flex gap="8px" wrap="wrap">
          <Button variant="secondary" onClick={() => setConfirm('regenerate')}>
            Get a new link
          </Button>
          <Button variant="secondary" color="status.danger" onClick={() => setConfirm('disable')}>
            Disable link
          </Button>
        </Flex>
      ) : (
        <Button alignSelf="flex-start" onClick={createLink} isLoading={issue.isPending}>
          Create export link
        </Button>
      )}

      {mutationError ? (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <AlertDescription>{errorMessage(mutationError)}</AlertDescription>
        </Alert>
      ) : null}
    </Stack>
  );
}

function IssuedLink({ url, unitName }: { url: string; unitName: string }) {
  const clipboard = useClipboard(url);

  return (
    <Stack spacing="12px">
      <Alert status="warning" borderRadius="12px">
        <AlertIcon />
        <AlertDescription>Copy this link now. For security it will not be shown again.</AlertDescription>
      </Alert>
      <InputGroup>
        <Input
          value={url}
          isReadOnly
          aria-label="Export link"
          fontFamily="mono"
          fontSize="12px"
          pr="92px"
          borderColor="line.500"
          borderRadius="12px"
          onFocus={(event) => event.target.select()}
        />
        <InputRightElement width="84px" pr="4px">
          <Button size="sm" onClick={clipboard.onCopy}>
            {clipboard.hasCopied ? 'Copied' : 'Copy'}
          </Button>
        </InputRightElement>
      </InputGroup>
      {!isReachableByHospitable(url) ? (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <AlertDescription>
            This link points to a local address, so Hospitable cannot reach it. Create the link on your deployed
            (staging or production) admin instead.
          </AlertDescription>
        </Alert>
      ) : null}
      <Box bg="bg.400" borderRadius="12px" p="14px 16px">
        <Text fontWeight={700} mb="6px">
          Add it in Hospitable
        </Text>
        <OrderedList spacing="4px" color="ink.400" pl="4px">
          <ListItem>
            Open <b>Properties</b> and choose <b>{unitName}</b>.
          </ListItem>
          <ListItem>
            In the calendar settings, find <b>iCal import</b> and add a new link.
          </ListItem>
          <ListItem>Paste the link, name it &quot;Sunmade&quot;, and save.</ListItem>
        </OrderedList>
        <Text color="ink.300" mt="8px" fontSize="13px">
          Hospitable checks the link about once an hour. The status turns green after its first fetch.
        </Text>
      </Box>
    </Stack>
  );
}
