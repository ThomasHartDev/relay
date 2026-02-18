import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      commandPaletteOpen: false,
      shortcutsDialogOpen: false,
      onboardingComplete: false,
      onboardingStep: 0,
    });
  });

  it("toggles sidebar", () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it("toggles command palette", () => {
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
    useUIStore.getState().toggleCommandPalette();
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);
  });

  it("sets shortcuts dialog open", () => {
    useUIStore.getState().setShortcutsDialogOpen(true);
    expect(useUIStore.getState().shortcutsDialogOpen).toBe(true);
    useUIStore.getState().setShortcutsDialogOpen(false);
    expect(useUIStore.getState().shortcutsDialogOpen).toBe(false);
  });

  it("manages onboarding flow", () => {
    expect(useUIStore.getState().onboardingStep).toBe(0);
    expect(useUIStore.getState().onboardingComplete).toBe(false);

    useUIStore.getState().setOnboardingStep(1);
    expect(useUIStore.getState().onboardingStep).toBe(1);

    useUIStore.getState().setOnboardingStep(2);
    expect(useUIStore.getState().onboardingStep).toBe(2);

    useUIStore.getState().completeOnboarding();
    expect(useUIStore.getState().onboardingComplete).toBe(true);
  });

  it("sets mobile nav open state", () => {
    useUIStore.getState().setSidebarMobileOpen(true);
    expect(useUIStore.getState().sidebarMobileOpen).toBe(true);
    useUIStore.getState().setSidebarMobileOpen(false);
    expect(useUIStore.getState().sidebarMobileOpen).toBe(false);
  });
});
