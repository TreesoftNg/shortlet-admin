'use client';

import { Button, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import NextLink from 'next/link';
import { LuCalendarDays } from 'react-icons/lu';
import { AppModal } from '@/shared/components/ui';
import { useCalendarSyncUiStore, type UnitCalendarTab } from '../store/calendar-sync-ui-store';
import type { UnitCalendarSummary } from '../types';
import { availabilityHref } from '@/shared/utils/calendar-deep-links';
import { BlockedDatesTab } from './blocked-dates-tab';
import { BookingsTab } from './bookings-tab';
import { ExportTab } from './export-tab';
import { ImportTab } from './import-tab';
import { TimelineTab } from './timeline-tab';

const TABS: { id: UnitCalendarTab; label: string }[] = [
  { id: 'timeline', label: 'Timeline' },
  { id: 'import', label: 'Import' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'blocks', label: 'Blocked dates' },
  { id: 'export', label: 'Export' },
];

/** Everything about one unit's calendar, including a visual timeline. */
export function UnitCalendarDialog({ unit }: { unit: UnitCalendarSummary }) {
  const activeTab = useCalendarSyncUiStore((state) => state.activeTab);
  const setTab = useCalendarSyncUiStore((state) => state.setTab);
  const close = useCalendarSyncUiStore((state) => state.close);
  const tabIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.id === activeTab),
  );

  return (
    <AppModal isOpen onClose={close} title={unit.name} size="4xl">
      <Flex justify="flex-end" mb="10px">
        <Button
          as={NextLink}
          href={availabilityHref(unit)}
          size="sm"
          variant="soft"
          leftIcon={<LuCalendarDays size={14} />}
        >
          Open in Availability
        </Button>
      </Flex>
      <Tabs
        index={tabIndex}
        onChange={(index) => setTab(TABS[index].id)}
        variant="unstyled"
        isLazy
      >
        <TabList
          overflowX="auto"
          overflowY="hidden"
          borderBottom="1px solid"
          borderColor="line.500"
          gap={{ base: '14px', md: '22px' }}
          css={{
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {TABS.map((tab) => (
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
              _selected={{
                color: 'ink.500',
                borderBottomColor: 'brand.500',
              }}
              _hover={{ color: 'ink.500' }}
            >
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel px={0} pt="20px">
            <TimelineTab unit={unit} />
          </TabPanel>
          <TabPanel px={0} pt="20px">
            <ImportTab unit={unit} />
          </TabPanel>
          <TabPanel px={0} pt="20px">
            <BookingsTab unit={unit} />
          </TabPanel>
          <TabPanel px={0} pt="20px">
            <BlockedDatesTab unit={unit} />
          </TabPanel>
          <TabPanel px={0} pt="20px">
            <ExportTab unit={unit} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </AppModal>
  );
}
