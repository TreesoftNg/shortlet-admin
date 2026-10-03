'use client';

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
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
import { LuCheck, LuCopy } from 'react-icons/lu';
import { ErrorState, KeyValueList, StatusBadge } from '@/shared/components/ui';
import { useIssueExportFeed, useRevokeExportFeed } from '../hooks/use-calendar-sync-mutations';
import { useExportFeed } from '../hooks/use-calendar-sync-queries';
import type { UnitCalendarSummary } from '../types';
import {
  describeExportGuidance,
  describeExportHealth,
  errorMessage,
  formatRelativeTime,
  isReachableByHospitable,
} from '../utils/calendar-sync-format';

/** The secret iCal link Hospitable imports to close Sunmade's blocked nights. */
export function ExportTab({ unit }: { unit: UnitCalendarSummary }) {
  const toast = useToast();
  const exportFeed = useExportFeed(unit.unitId);
  const issue = useIssueExportFeed(unit.unitId);
  const revoke = useRevokeExportFeed(unit.unitId);
  // Shown once, straight after creation; the API only stores its hash.
  const [issuedUrl, setIssuedUrl] = useState<string | null>(null);
  const [wasRotated, setWasRotated] = useState(false);
  const [confirm, setConfirm] = useState<'regenerate' | 'disable' | null>(null);

  const createLink = () =>
    issue.mutate(undefined, {
      onSuccess: ({ url, rotated }) => {
        setIssuedUrl(url);
        setWasRotated(rotated);
        setConfirm(null);
        toast({
          status: 'success',
          title: rotated ? 'New export link ready' : 'Export link created',
          description: rotated
            ? 'The previous link stopped working. Copy the new one into Hospitable now.'
            : 'Copy the link now — it will not be shown again.',
        });
      },
    });

  const disableLink = () =>
    revoke.mutate(undefined, {
      onSuccess: () => {
        setConfirm(null);
        setIssuedUrl(null);
        setWasRotated(false);
        toast({
          status: 'success',
          title: 'Export link disabled',
          description: 'Remove the old link from Hospitable’s iCal import too.',
        });
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
    return (
      <ErrorState
        minH="180px"
        message={errorMessage(exportFeed.error)}
        onRetry={() => void exportFeed.refetch()}
      />
    );
  }

  const current = exportFeed.data;
  const health = describeExportHealth(current);
  const guidance = issuedUrl ? null : describeExportGuidance(current);
  const mutationError = issue.error ?? revoke.error;

  return (
    <Stack spacing="18px" fontSize="14px">
      <Text color="ink.400">
        Sends this unit&apos;s blocked dates to Hospitable, which closes the same nights on Airbnb and
        Booking.com. Guests&apos; details are never included.
      </Text>

      {issuedUrl ? (
        <IssuedLink
          url={issuedUrl}
          unitName={unit.name}
          rotated={wasRotated}
          onDone={() => {
            setIssuedUrl(null);
            setWasRotated(false);
          }}
        />
      ) : current ? (
        <Stack spacing="14px">
          <KeyValueList
            items={[
              {
                label: 'Status',
                value: <StatusBadge tone={health.tone}>{health.label}</StatusBadge>,
              },
              { label: 'Link created', value: formatRelativeTime(current.issuedAt) },
              {
                label: 'Last fetched by Hospitable',
                value: formatRelativeTime(current.lastAccessedAt),
              },
            ]}
          />
          <Text color="ink.300" fontSize="13px">
            For security the secret URL is only shown once when created. Rotate the link if it was
            lost or leaked — then replace it in Hospitable.
          </Text>
        </Stack>
      ) : null}

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

      {confirm ? (
        <Alert status="warning" borderRadius="12px" alignItems="flex-start">
          <AlertIcon mt="2px" />
          <Stack spacing="10px">
            <Box>
              <AlertTitle fontSize="14px" mb="4px">
                {confirm === 'regenerate' ? 'Rotate export link?' : 'Disable export link?'}
              </AlertTitle>
              <AlertDescription>
                {confirm === 'regenerate'
                  ? 'The current link stops working immediately. You must paste the new link into Hospitable’s iCal import, or blocked dates will stop syncing out.'
                  : 'Hospitable will stop receiving blocked dates for this unit until you create a new link and paste it there.'}
              </AlertDescription>
            </Box>
            <Flex gap="8px">
              {confirm === 'regenerate' ? (
                <Button size="sm" onClick={createLink} isLoading={issue.isPending}>
                  Rotate link
                </Button>
              ) : (
                <Button
                  size="sm"
                  bg="status.danger"
                  _hover={{ opacity: 0.9 }}
                  onClick={disableLink}
                  isLoading={revoke.isPending}
                >
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
          {!issuedUrl ? (
            <Button variant="secondary" onClick={() => setConfirm('regenerate')}>
              Rotate link
            </Button>
          ) : null}
          <Button
            variant="secondary"
            color="status.danger"
            onClick={() => setConfirm('disable')}
          >
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

function IssuedLink({
  url,
  unitName,
  rotated,
  onDone,
}: {
  url: string;
  unitName: string;
  rotated: boolean;
  onDone: () => void;
}) {
  const toast = useToast();
  const clipboard = useClipboard(url);

  const copy = () => {
    clipboard.onCopy();
    toast({
      status: 'success',
      title: 'Link copied',
      description: 'Paste it into Hospitable’s iCal import.',
      duration: 2500,
    });
  };

  return (
    <Stack spacing="12px">
      <Alert status="warning" borderRadius="12px" alignItems="flex-start">
        <AlertIcon mt="2px" />
        <Box>
          <AlertTitle fontSize="14px" mb="4px">
            {rotated ? 'New link — copy it now' : 'Copy this link now'}
          </AlertTitle>
          <AlertDescription>
            {rotated
              ? 'The previous link was revoked. For security this URL will not be shown again.'
              : 'For security this URL will not be shown again after you leave this screen.'}
          </AlertDescription>
        </Box>
      </Alert>

      <InputGroup>
        <Input
          value={url}
          isReadOnly
          aria-label="Export link"
          fontFamily="mono"
          fontSize="12px"
          pr="108px"
          borderColor="line.500"
          borderRadius="12px"
          onFocus={(event) => event.target.select()}
        />
        <InputRightElement width="100px" pr="4px">
          <Button
            size="sm"
            onClick={copy}
            leftIcon={clipboard.hasCopied ? <LuCheck size={14} /> : <LuCopy size={14} />}
          >
            {clipboard.hasCopied ? 'Copied' : 'Copy'}
          </Button>
        </InputRightElement>
      </InputGroup>

      {!isReachableByHospitable(url) ? (
        <Alert status="error" borderRadius="12px">
          <AlertIcon />
          <AlertDescription>
            This link points to a local address, so Hospitable cannot reach it. Create the link on
            your deployed (staging or production) admin instead.
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
            In the calendar settings, find <b>iCal import</b>
            {rotated ? ' and replace the old Sunmade link' : ' and add a new link'}.
          </ListItem>
          <ListItem>Paste the link, name it &quot;Sunmade&quot;, and save.</ListItem>
        </OrderedList>
        <Text color="ink.300" mt="8px" fontSize="13px">
          Hospitable checks the link about once an hour. Status turns green after the first fetch.
        </Text>
      </Box>

      <Button variant="secondary" alignSelf="flex-start" onClick={onDone}>
        I&apos;ve pasted it in Hospitable
      </Button>
    </Stack>
  );
}
