import { create } from 'zustand';

export type UnitCalendarTab = 'timeline' | 'import' | 'bookings' | 'blocks' | 'export';

type CalendarSyncUiState = {
  /** Unit whose calendar dialog is open, if any. */
  selectedUnitId: string | null;
  activeTab: UnitCalendarTab;
  openUnit: (unitId: string, tab?: UnitCalendarTab) => void;
  setTab: (tab: UnitCalendarTab) => void;
  close: () => void;
};

/** UI state for the calendar-sync page only; server data lives in React Query. */
export const useCalendarSyncUiStore = create<CalendarSyncUiState>((set) => ({
  selectedUnitId: null,
  activeTab: 'import',
  openUnit: (unitId, tab = 'timeline') => set({ selectedUnitId: unitId, activeTab: tab }),
  setTab: (tab) => set({ activeTab: tab }),
  close: () => set({ selectedUnitId: null }),
}));
