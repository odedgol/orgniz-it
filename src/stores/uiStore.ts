import { create } from 'zustand';
import type { ViewType } from '@/types';

interface UIState {
  currentView: ViewType;
  selectedDate: Date;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  setCurrentView: (view: ViewType) => void;
  setSelectedDate: (date: Date) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
  navigateDate: (direction: 'prev' | 'next') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  currentView: 'week',
  selectedDate: new Date(),
  sidebarOpen: true,
  commandPaletteOpen: false,

  setCurrentView: (view) => set({ currentView: view }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  navigateDate: (direction) => {
    const { selectedDate, currentView } = get();
    const newDate = new Date(selectedDate);

    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }

    set({ selectedDate: newDate });
  },
}));
