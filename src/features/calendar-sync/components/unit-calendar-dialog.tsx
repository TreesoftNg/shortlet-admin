'use client';

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { AppModal } from '@/shared/components/ui';
import { useCalendarSyncUiStore, type UnitCalendarTab } from '../store/calendar-sync-ui-store';
import type { UnitCalendarSummary } from '../types';
import { BlockedDatesTab } from './blocked-dates-tab';
import { BookingsTab } from './bookings-tab';
import { ExportTab } from './export-tab';
import { ImportTab } from './import-tab';

const TABS: { id: UnitCalendarTab; label: string }[] = [
  { id: 'import', label: 'Import' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'blocks', label: 'Blocked dates' },
  { id: 'export', label: 'Export' },
];

/** Everything about one unit's calendar, in four tabs. */
export function UnitCalendarDialog({ unit }: { unit: UnitCalendarSummary }) {
  const activeTab = useCalendarSyncUiStore((state) => state.activeTab);
  const setTab = useCalendarSyncUiStore((state) => state.setTab);
  const close = useCalendarSyncUiStore((state) => state.close);

  return (
    <AppModal isOpen onClose={close} title={unit.name} size="2xl">
      <Tabs
        index={TABS.findIndex((tab) => tab.id === activeTab)}
        onChange={(index) => setTab(TABS[index].id)}
        colorScheme="brand"
        isLazy
      >
        <TabList overflowX="auto" overflowY="hidden">
          {TABS.map((tab) => (
            <Tab key={tab.id} fontWeight={600} fontSize="14px" whiteSpace="nowrap">
              {tab.label}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
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
