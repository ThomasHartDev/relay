import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  commandPaletteOpen: boolean;
  shortcutsDialogOpen: boolean;
  onboardingComplete: boolean;
  onboardingStep: number;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarMobileOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setShortcutsDialogOpen: (open: boolean) => void;
  setOnboardingStep: (step: number) => void;
  completeOnboarding: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      commandPaletteOpen: false,
      shortcutsDialogOpen: false,
      onboardingComplete: false,
      onboardingStep: 0,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setShortcutsDialogOpen: (open) => set({ shortcutsDialogOpen: open }),
      setOnboardingStep: (step) => set({ onboardingStep: step }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    {
      name: "relay-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
);
