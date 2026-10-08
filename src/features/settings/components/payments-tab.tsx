'use client';

import { Badge, Box, Button, Flex, Input, ListItem, Text, UnorderedList, useClipboard } from '@chakra-ui/react';
import { ErrorState, KeyValueList, PageSkeleton } from '@/shared/components/ui';
import { usePaymentSettings } from '../hooks/use-business-settings';
import { Section } from './settings-form-parts';

/** Flutterwave status (keys stay on the server and are never shown). */
export function PaymentsTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = usePaymentSettings(canManage);
  const { onCopy, hasCopied } = useClipboard(data?.webhookUrl ?? '');

  if (!canManage) {
    return (
      <Text fontSize="14px" color="ink.300">
        Only owners and admins can see payment settings.
      </Text>
    );
  }
  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load payment settings'}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <Flex direction="column" gap="28px">
      <Section title="Flutterwave">
        <Flex gap="8px" align="center" mb="8px" wrap="wrap">
          <Badge colorScheme={data.configured ? 'green' : 'red'}>{data.configured ? 'Connected' : 'Not set up'}</Badge>
          {data.mode ? <Badge colorScheme={data.mode === 'live' ? 'green' : 'orange'}>{data.mode === 'live' ? 'Live' : 'Test mode'}</Badge> : null}
        </Flex>
        <KeyValueList
          items={[
            { label: 'Webhook secret hash', value: data.webhookSecretSet ? 'Set' : 'Not set' },
            {
              label: 'Last webhook received',
              value: data.lastWebhookAt
                ? new Date(data.lastWebhookAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })
                : 'None yet',
            },
          ]}
        />
      </Section>

      <Section title="Webhook URL" description="Paste this on the Flutterwave dashboard under Settings → Webhooks.">
        <Flex gap="8px">
          <Input aria-label="Webhook URL" value={data.webhookUrl} isReadOnly borderColor="line.500" borderRadius="12px" h="44px" />
          <Button variant="secondary" onClick={onCopy} flexShrink={0} h="44px">
            {hasCopied ? 'Copied' : 'Copy'}
          </Button>
        </Flex>
      </Section>

      <Box borderRadius="14px" bg="bg.400" p="16px" fontSize="14px" color="ink.400">
        <Text fontWeight={700} color="ink.500" mb="6px">
          Setup tips
        </Text>
        <UnorderedList spacing="4px">
          <ListItem>The URL must end in /flutterwave.</ListItem>
          <ListItem>Test mode and live mode have separate webhook settings on the dashboard.</ListItem>
          <ListItem>The secret hash on the dashboard must match FLUTTERWAVE_WEBHOOK_HASH on the server.</ListItem>
          <ListItem>The keys are set on the server by your developer; they are never shown here.</ListItem>
        </UnorderedList>
      </Box>
    </Flex>
  );
}
