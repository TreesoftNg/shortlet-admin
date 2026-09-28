'use client';

import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Spinner,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { useSettings } from '@/features/settings/hooks/use-settings';
import {
  NOTIFICATION_OPTIONS,
  formatSettingsUpdatedAt,
} from '@/features/settings/utils/settings-helpers';
import { PageHeader, Panel } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import type {
  TenantNotificationSettings,
  TenantOrganizationSettings,
} from '@/shared/types/hospitable';

export function SettingsPage() {
  const { data, isLoading, isError, error } = useSettings();
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const [org, setOrg] = useState<TenantOrganizationSettings | null>(null);
  const [notifications, setNotifications] =
    useState<TenantNotificationSettings | null>(null);

  useEffect(() => {
    if (!data) return;
    setOrg(data.organization);
    setNotifications(data.notifications);
  }, [data]);

  if (isLoading) {
    return (
      <Flex minH="320px" align="center" justify="center">
        <Spinner color="brand.500" size="lg" />
      </Flex>
    );
  }

  if (isError || !data || !org || !notifications) {
    return (
      <Text color="status.danger">
        {error instanceof Error ? error.message : 'Failed to load settings'}
      </Text>
    );
  }

  return (
    <Box maxW="720px">
      <PageHeader
        title="Settings"
        description={`Last updated ${formatSettingsUpdatedAt(data.updated_at)}`}
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
          <Text fontSize="18px" fontWeight={700} mb="14px">
            Business
          </Text>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap="14px">
            <FormControl>
              <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
                Name
              </FormLabel>
              <Input
                value={org.name}
                onChange={(event) =>
                  setOrg((current) =>
                    current ? { ...current, name: event.target.value } : current,
                  )
                }
                borderColor="line.500"
                borderRadius="12px"
                h="40px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
                Support email
              </FormLabel>
              <Input
                type="email"
                value={org.support_email}
                onChange={(event) =>
                  setOrg((current) =>
                    current
                      ? { ...current, support_email: event.target.value }
                      : current,
                  )
                }
                borderColor="line.500"
                borderRadius="12px"
                h="40px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
                Timezone
              </FormLabel>
              <Input
                value={org.timezone}
                onChange={(event) =>
                  setOrg((current) =>
                    current
                      ? { ...current, timezone: event.target.value }
                      : current,
                  )
                }
                borderColor="line.500"
                borderRadius="12px"
                h="40px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="12px" fontWeight={700} color="ink.300">
                Currency
              </FormLabel>
              <Input
                value={org.currency}
                onChange={(event) =>
                  setOrg((current) =>
                    current
                      ? { ...current, currency: event.target.value }
                      : current,
                  )
                }
                borderColor="line.500"
                borderRadius="12px"
                h="40px"
              />
            </FormControl>
          </Grid>
        </Panel>

        <Panel>
          <Text fontSize="18px" fontWeight={700} mb="14px">
            Email alerts
          </Text>
          <Flex direction="column">
            {NOTIFICATION_OPTIONS.map((option) => (
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
                <Text fontWeight={600} fontSize="14px">
                  {option.label}
                </Text>
                <Switch
                  colorScheme="green"
                  isChecked={notifications[option.key]}
                  onChange={(event) =>
                    setNotifications((current) =>
                      current
                        ? { ...current, [option.key]: event.target.checked }
                        : current,
                    )
                  }
                />
              </Flex>
            ))}
          </Flex>
        </Panel>

        <Button alignSelf="flex-start" variant="dark" borderRadius="12px" h="40px">
          Save changes
        </Button>
      </Flex>
    </Box>
  );
}
