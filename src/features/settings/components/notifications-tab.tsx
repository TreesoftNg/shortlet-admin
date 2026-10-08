'use client';

import { Box, Flex, Switch, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { useUpdateSettings } from '@/features/settings/hooks/use-settings-mutations';
import { formatSettingsUpdatedAt, settingsValuesMap } from '@/features/settings/utils/settings-helpers';
import { ErrorState, PageSkeleton } from '@/shared/components/ui';
import type { TenantSettingItem } from '../types';
import { SaveBar, Section, useSettingsToasts } from './settings-form-parts';

/** Which events email the tenant's staff. */
export function NotificationsTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const toasts = useSettingsToasts();
  const [settings, setSettings] = useState<TenantSettingItem[] | null>(null);

  useEffect(() => {
    if (data) setSettings(data.settings);
  }, [data]);

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !data || !settings) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : 'Failed to load settings'}
        onRetry={() => void refetch()}
      />
    );
  }

  const save = async () => {
    try {
      const saved = await updateSettings.mutateAsync(settingsValuesMap(settings));
      setSettings(saved.settings);
      toasts.saved();
    } catch (err) {
      toasts.failed(err);
    }
  };

  return (
    <Flex direction="column" gap="28px">
      <Section
        title="Email alerts"
        description={`Choose which events notify your staff by email. Last updated ${formatSettingsUpdatedAt(data.updatedAt)}.`}
      >
        <Flex direction="column">
          {settings.map((option) => (
            <Flex
              key={option.key}
              justify="space-between"
              align="center"
              gap="16px"
              py="12px"
              borderBottom="1px solid"
              borderColor="line.400"
              _last={{ borderBottom: 0 }}
            >
              <Box minW={0}>
                <Text fontWeight={600} fontSize="14px">
                  {option.label}
                </Text>
                {option.description ? (
                  <Text fontSize="12px" color="ink.300" mt="2px">
                    {option.description}
                  </Text>
                ) : null}
              </Box>
              <Switch
                colorScheme="green"
                isChecked={option.value}
                isDisabled={!canManage || updateSettings.isPending}
                onChange={(event) =>
                  setSettings((current) =>
                    current
                      ? current.map((item) =>
                          item.key === option.key ? { ...item, value: event.target.checked } : item,
                        )
                      : current,
                  )
                }
              />
            </Flex>
          ))}
        </Flex>
      </Section>

      <SaveBar canManage={canManage} isSaving={updateSettings.isPending} onSave={() => void save()} />
    </Flex>
  );
}
