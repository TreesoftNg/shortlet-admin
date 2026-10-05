'use client';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Switch,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { useUpdateSettings } from '@/features/settings/hooks/use-settings-mutations';
import {
  formatSettingsUpdatedAt,
  settingsValuesMap,
} from '@/features/settings/utils/settings-helpers';
import { ErrorState, PageHeader, PageSkeleton, Panel } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { ApiClientError } from '@/shared/api/types';
import type { TenantSettingItem } from '../types';

export function SettingsPage() {
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'settings.manage');
  const { data, isLoading, isError, error, refetch } = useSettings();
  const updateSettings = useUpdateSettings();
  const toast = useToast();
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const [settings, setSettings] = useState<TenantSettingItem[] | null>(null);

  useEffect(() => {
    if (!data) return;
    setSettings(data.settings);
  }, [data]);

  if (isLoading) {
    return <PageSkeleton variant="form" />;
  }

  if (isError || !data || !settings) {
    return (
      <ErrorState
        message={
          error instanceof Error ? error.message : 'Failed to load settings'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  async function handleSave() {
    if (!settings) return;
    try {
      const saved = await updateSettings.mutateAsync(settingsValuesMap(settings));
      setSettings(saved.settings);
      toast({
        title: 'Settings saved',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Could not save',
        description:
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }

  return (
    <Box maxW="720px">
      <PageHeader
        title="Settings"
        description={`Last updated ${formatSettingsUpdatedAt(data.updatedAt)}`}
        actions={
          <IconButton
            aria-label="Open navigation"
            icon={<LuMenu size={20} />}
            display={{ base: 'inline-flex', lg: 'none' }}
            variant="secondary"
            borderRadius="12px"
            h="44px"
            w="44px"
            onClick={openMobileNav}
          />
        }
      />

      <Flex direction="column" gap="18px">
        <Panel>
          <Text fontSize="18px" fontWeight={700} mb="4px">
            Email alerts
          </Text>
          <Text fontSize="13px" color="ink.300" mb="14px">
            Choose which events notify your staff by email.
          </Text>
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
                            item.key === option.key
                              ? { ...item, value: event.target.checked }
                              : item,
                          )
                        : current,
                    )
                  }
                />
              </Flex>
            ))}
          </Flex>
        </Panel>

        {canManage ? (
          <Button
            alignSelf="flex-start"
            variant="dark"
            borderRadius="12px"
            h="40px"
            isLoading={updateSettings.isPending}
            onClick={() => void handleSave()}
          >
            Save changes
          </Button>
        ) : null}
      </Flex>
    </Box>
  );
}
