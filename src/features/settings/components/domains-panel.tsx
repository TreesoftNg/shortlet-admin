'use client';

import { Button, Flex, IconButton, Input, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuPlus, LuTrash2 } from 'react-icons/lu';
import { apiFieldErrors } from '@/shared/api/field-errors';
import { ErrorState, FormPanel, FormRow, PageSkeleton } from '@/shared/components/ui';
import { useTenantDomains, useUpdateTenantDomains } from '../hooks/use-business-settings';
import { controlProps, SaveBar, useSettingsToasts } from './settings-form-parts';

/** Hostname only — no scheme or path. */
function looksLikeHostname(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;
  if (trimmed === 'localhost' || trimmed === '127.0.0.1') return true;
  try {
    const host = trimmed.includes('://')
      ? new URL(trimmed).hostname
      : trimmed.includes('/')
        ? new URL(`https://${trimmed}`).hostname
        : trimmed;
    return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(
      host,
    ) || host === 'localhost' || host === '127.0.0.1';
  } catch {
    return false;
  }
}

/**
 * Registered guest-site hostnames (tenant_domains). Guests can only complete
 * checkout when returnUrl is on one of these hosts.
 */
export function DomainsPanel({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = useTenantDomains();
  const update = useUpdateTenantDomains();
  const toasts = useSettingsToasts();
  const [domains, setDomains] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [listError, setListError] = useState<string | undefined>();
  const [draftError, setDraftError] = useState<string | undefined>();

  useEffect(() => {
    if (data) setDomains(data.domains.map((row) => row.domain));
  }, [data]);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load website domains'}
        onRetry={() => void refetch()}
      />
    );
  }

  const saved = data.domains.map((row) => row.domain);
  const isDirty = JSON.stringify(domains) !== JSON.stringify(saved);

  const addDraft = () => {
    const value = draft.trim().toLowerCase();
    setDraftError(undefined);
    if (!value) return;
    if (!looksLikeHostname(value)) {
      setDraftError('Enter a hostname like sunmadeapartments.com');
      return;
    }
    let host = value;
    try {
      if (value.includes('://') || value.includes('/')) {
        host = new URL(value.includes('://') ? value : `https://${value}`).hostname;
      }
    } catch {
      setDraftError('Enter a hostname like sunmadeapartments.com');
      return;
    }
    if (domains.includes(host)) {
      setDraftError('That hostname is already in the list');
      return;
    }
    setDomains((current) => [...current, host]);
    setDraft('');
  };

  const save = async () => {
    setListError(undefined);
    if (!domains.length) {
      setListError('Add at least one website hostname');
      toasts.invalid();
      return;
    }
    try {
      const result = await update.mutateAsync({ domains });
      setDomains(result.domains.map((row) => row.domain));
      toasts.saved();
    } catch (err) {
      const fields = apiFieldErrors(err);
      setListError(fields.domains ?? (err instanceof Error ? err.message : 'Could not save'));
      toasts.failed(err);
    }
  };

  return (
    <Flex direction="column" gap="20px">
      <FormPanel
        title="Website domains"
        description="Hostnames for your guest site. Booking checkout only redirects back to these. An apex domain (e.g. sunmadeapartments.com) also covers its subdomains."
      >
        <FormRow
          label="Registered domains"
          description="Hostname only — no https://. Include every host guests book from (production and staging)."
          error={listError}
          isStacked
        >
          <Flex direction="column" gap="10px" w="100%">
            {domains.length === 0 ? (
              <Text fontSize="14px" color="ink.300">
                No domains yet. Add your guest website hostname.
              </Text>
            ) : (
              domains.map((domain) => (
                <Flex
                  key={domain}
                  align="center"
                  gap="10px"
                  px="12px"
                  py="8px"
                  border="1px solid"
                  borderColor="line.500"
                  borderRadius="10px"
                  bg="white"
                >
                  <Text flex="1" fontSize="14px" fontWeight={600} color="ink.500">
                    {domain}
                  </Text>
                  {canManage ? (
                    <IconButton
                      aria-label={`Remove ${domain}`}
                      icon={<LuTrash2 size={16} />}
                      size="sm"
                      variant="ghost"
                      onClick={() => setDomains((current) => current.filter((item) => item !== domain))}
                    />
                  ) : null}
                </Flex>
              ))
            )}

            {canManage ? (
              <Flex gap="10px" direction={{ base: 'column', sm: 'row' }} align={{ sm: 'flex-start' }}>
                <Flex direction="column" gap="4px" flex="1">
                  <Input
                    {...controlProps}
                    w="100%"
                    id="tenant-domain-draft"
                    aria-label="New domain"
                    placeholder="staging.sunmadeapartments.com"
                    value={draft}
                    onChange={(event) => {
                      setDraft(event.target.value);
                      setDraftError(undefined);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addDraft();
                      }
                    }}
                    isInvalid={Boolean(draftError)}
                  />
                  {draftError ? (
                    <Text fontSize="12px" color="red.500">
                      {draftError}
                    </Text>
                  ) : null}
                </Flex>
                <Button
                  leftIcon={<LuPlus size={16} />}
                  variant="secondary"
                  h="40px"
                  borderRadius="10px"
                  onClick={addDraft}
                >
                  Add
                </Button>
              </Flex>
            ) : null}
          </Flex>
        </FormRow>
      </FormPanel>

      <SaveBar
        canManage={canManage}
        isSaving={update.isPending}
        isDirty={isDirty}
        onSave={() => void save()}
        saveLabel="Save domains"
      />
    </Flex>
  );
}
