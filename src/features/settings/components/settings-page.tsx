'use client';

import { Box, Flex, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuMenu } from 'react-icons/lu';
import { useMe } from '@/features/auth/hooks/use-auth';
import { hasPermission } from '@/features/auth/utils/auth-helpers';
import { PageHeader, Panel } from '@/shared/components/ui';
import { useUiStore } from '@/shared/store/ui-store';
import { BookingRulesTab } from './booking-rules-tab';
import { BusinessTab } from './business-tab';
import { NotificationsTab } from './notifications-tab';
import { PaymentsTab } from './payments-tab';
import { PricingTab } from './pricing-tab';

const SETTINGS_TABS = [
  { id: 'business', label: 'Business' },
  { id: 'pricing', label: 'Pricing & tax' },
  { id: 'bookings', label: 'Bookings & deposits' },
  { id: 'payments', label: 'Payments' },
  { id: 'notifications', label: 'Notifications' },
] as const;

type SettingsTabId = (typeof SETTINGS_TABS)[number]['id'];

export function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: profile } = useMe();
  const canManage = hasPermission(profile, 'settings.manage');
  const openMobileNav = useUiStore((state) => state.openMobileNav);

  const tabIndex = Math.max(
    0,
    SETTINGS_TABS.findIndex((tab) => tab.id === searchParams.get('tab')),
  );
  const currentTab: SettingsTabId = SETTINGS_TABS[tabIndex].id;

  return (
    <Box maxW="960px">
      <PageHeader
        title="Settings"
        description="Business details, prices, booking rules and alerts"
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

      <Panel p={{ base: '18px', md: '28px' }}>
        <Flex direction="column" gap="28px">
          <Tabs
            index={tabIndex}
            onChange={(index) => {
              const tab = SETTINGS_TABS[index]?.id ?? 'business';
              router.replace(tab === 'business' ? '/settings' : `/settings?tab=${tab}`, { scroll: false });
            }}
            variant="unstyled"
          >
            <TabList
              overflowX="auto"
              borderBottom="1px solid"
              borderColor="line.500"
              gap={{ base: '14px', md: '22px' }}
              css={{ '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}
            >
              {SETTINGS_TABS.map((tab) => (
                <Tab
                  key={tab.id}
                  fontWeight={700}
                  fontSize="14px"
                  whiteSpace="nowrap"
                  h="auto"
                  minW="auto"
                  px="2px"
                  pb="12px"
                  borderRadius="0"
                  color="ink.300"
                  borderBottom="3px solid transparent"
                  mb="-1px"
                  _selected={{ color: 'ink.500', borderBottomColor: 'brand.500' }}
                >
                  {tab.label}
                </Tab>
              ))}
            </TabList>
            <TabPanels display="none">
              {SETTINGS_TABS.map((tab) => (
                <TabPanel key={tab.id} />
              ))}
            </TabPanels>
          </Tabs>

          {currentTab === 'business' ? <BusinessTab canManage={canManage} /> : null}
          {currentTab === 'pricing' ? <PricingTab canManage={canManage} /> : null}
          {currentTab === 'bookings' ? <BookingRulesTab canManage={canManage} /> : null}
          {currentTab === 'payments' ? <PaymentsTab canManage={canManage} /> : null}
          {currentTab === 'notifications' ? <NotificationsTab canManage={canManage} /> : null}
        </Flex>
      </Panel>
    </Box>
  );
}
