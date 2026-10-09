'use client';

import { Flex, Switch } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { useUpdateSettings } from '@/features/settings/hooks/use-settings-mutations';
import {
  formatSettingsUpdatedAt,
  notificationSettings,
  settingsValuesMap,
} from '@/features/settings/utils/settings-helpers';
import { ErrorState, FormPanel, FormRow, PageSkeleton } from '@/shared/components/ui';
import type { TenantSettingItem } from '../types';
import { SaveBar, useSettingsToasts } from './settings-form-parts';

/** Which events email the tenant's staff. */
export function NotificationsTab({ canManage }: { canManage: boolean }) {
  const { data, isLoading, isError, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const toasts = useSettingsToasts();
  const [settings, setSettings] = useState<TenantSettingItem[] | null>(null);

  useEffect(() => {
    if (data) setSettings(notificationSettings(data.settings));
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

  const savedNotifications = notificationSettings(data.settings);
  const isDirty =
    JSON.stringify(settingsValuesMap(settings)) !==
    JSON.stringify(settingsValuesMap(savedNotifications));

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
    <Flex direction="column" gap="20px">
      <FormPanel
        title="Email alerts"
        description={`Choose which events email owners and admins. Last updated ${formatSettingsUpdatedAt(data.updatedAt)}.`}
      >
        {settings.map((option) => (
          <FormRow
            key={option.key}
            label={option.label}
            labelFor={`alert-${option.key}`}
            description={option.description ?? undefined}
            isInline
          >
            <Switch
              id={`alert-${option.key}`}
              colorScheme="green"
              isChecked={option.value}
              isDisabled={!canManage || updateSettings.isPending}
              onChange={(event) =>
                setSettings((current) =>
                  current
                    ? current.map((item) => (item.key === option.key ? { ...item, value: event.target.checked } : item))
                    : current,
                )
              }
            />
          </FormRow>
        ))}
      </FormPanel>

      <SaveBar
        canManage={canManage}
        isSaving={updateSettings.isPending}
        isDirty={isDirty}
        onSave={() => void save()}
      />
    </Flex>
  );
}
