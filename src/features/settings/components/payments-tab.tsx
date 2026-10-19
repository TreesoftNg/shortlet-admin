'use client';

import { Box, Button, Flex, Input, ListItem, Text, UnorderedList, useClipboard } from '@chakra-ui/react';
import { ErrorState, FormPanel, FormRow, PageSkeleton, StatusBadge } from '@/shared/components/ui';
import { formatProviderLabel } from '@/features/payments/utils/payment-filters';
import { usePaymentSettings } from '../hooks/use-business-settings';

/** Active checkout provider status (keys stay on the server and are never shown). */
export function PaymentsTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = usePaymentSettings(canManage);
  const { onCopy, hasCopied } = useClipboard(data?.webhookUrl ?? '');

  if (!canManage) {
    return (
      <FormPanel title="Payments">
        <Box px="18px" py="16px">
          <Text fontSize="14px" color="ink.300">
            Only owners and admins can see payment settings.
          </Text>
        </Box>
      </FormPanel>
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

  const providerLabel = formatProviderLabel(data.provider);
  const isFlutterwave = data.provider === 'flutterwave';
  const otherNote = data.otherProviders
    ?.map(
      (row) =>
        `${formatProviderLabel(row.provider)} (${row.configured ? 'keys set' : 'not configured'})`,
    )
    .join(', ');

  return (
    <Flex direction="column" gap="20px">
      <FormPanel
        title={providerLabel}
        description={`Guests pay by card, bank transfer or USSD through ${providerLabel}.`}
        headerAction={
          <StatusBadge tone={data.configured ? 'ok' : 'danger'} flexShrink={0}>
            {data.configured ? 'Connected' : 'Not set up'}
          </StatusBadge>
        }
      >
        <FormRow label="Mode" description="Test mode takes no real money." isInline>
          {data.mode ? (
            <StatusBadge tone={data.mode === 'live' ? 'ok' : 'warn'}>
              {data.mode === 'live' ? 'Live' : 'Test mode'}
            </StatusBadge>
          ) : (
            <Text fontSize="14px" color="ink.300">
              —
            </Text>
          )}
        </FormRow>
        {isFlutterwave ? (
          <FormRow
            label="Webhook secret hash"
            description="Proves that payment updates really come from Flutterwave."
            isInline
          >
            <StatusBadge tone={data.webhookSecretSet ? 'ok' : 'danger'}>
              {data.webhookSecretSet ? 'Set' : 'Not set'}
            </StatusBadge>
          </FormRow>
        ) : (
          <FormRow
            label="Webhook signature"
            description={`${providerLabel} signs webhooks with the secret key on the server.`}
            isInline
          >
            <StatusBadge tone={data.webhookSecretSet ? 'ok' : 'danger'}>
              {data.webhookSecretSet ? 'Secret key set' : 'Secret key missing'}
            </StatusBadge>
          </FormRow>
        )}
        <FormRow
          label="Last webhook received"
          description={`The most recent payment update from ${providerLabel}.`}
          isInline
        >
          <Text fontSize="14px" fontWeight={600} color="ink.500" textAlign="right">
            {data.lastWebhookAt
              ? new Date(data.lastWebhookAt).toLocaleString('en-GB', { timeZone: 'Africa/Lagos' })
              : 'None yet'}
          </Text>
        </FormRow>
        {otherNote ? (
          <FormRow
            label="Other providers"
            description="Still used to verify or refund older payments."
            isInline
          >
            <Text fontSize="14px" fontWeight={600} color="ink.500" textAlign="right">
              {otherNote}
            </Text>
          </FormRow>
        ) : null}
      </FormPanel>

      <FormPanel
        title="Webhook URL"
        description={`Paste this on the ${providerLabel} dashboard under ${
          isFlutterwave ? 'Settings → Webhooks' : 'Settings → API Keys & Webhooks'
        }.`}
        footer={
          <Box>
            <Text fontWeight={600} color="ink.500" mb="4px">
              Setup tips
            </Text>
            <UnorderedList spacing="2px" color="ink.400">
              <ListItem>The URL must end in /{data.provider}.</ListItem>
              <ListItem>Test mode and live mode have separate webhook settings on the dashboard.</ListItem>
              {isFlutterwave ? (
                <ListItem>
                  The secret hash on the dashboard must match FLUTTERWAVE_WEBHOOK_HASH on the server.
                </ListItem>
              ) : (
                <ListItem>
                  {providerLabel} signs the raw body with HMAC-SHA512 using PAYSTACK_SECRET_KEY.
                </ListItem>
              )}
              <ListItem>The keys are set on the server by your developer; they are never shown here.</ListItem>
            </UnorderedList>
          </Box>
        }
      >
        <Flex gap="8px" px="18px" py="16px">
          <Input
            aria-label="Webhook URL"
            value={data.webhookUrl}
            isReadOnly
            fontFamily="mono"
            fontSize="13px"
            borderColor="line.500"
            borderRadius="10px"
            h="40px"
            bg="bg.400"
          />
          <Button variant="secondary" onClick={onCopy} flexShrink={0} h="40px" borderRadius="10px" minW="84px">
            {hasCopied ? 'Copied' : 'Copy'}
          </Button>
        </Flex>
      </FormPanel>
    </Flex>
  );
}
