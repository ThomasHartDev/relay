import { describe, expect, it, beforeEach } from "vitest";
import { useUIStore } from "./ui-store";

describe("useUIStore", () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      commandPaletteOpen: false,
    });
  });

  it("starts with sidebar expanded", () => {
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it("toggles sidebar collapsed state", () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarCollapsed).toBe(false);
  });

  it("sets sidebar collapsed directly", () => {
    useUIStore.getState().setSidebarCollapsed(true);
    expect(useUIStore.getState().sidebarCollapsed).toBe(true);
  });

  it("starts with command palette closed", () => {
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
  });

  it("toggles command palette", () => {
    useUIStore.getState().toggleCommandPalette();
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);

    useUIStore.getState().toggleCommandPalette();
    expect(useUIStore.getState().commandPaletteOpen).toBe(false);
  });

  it("sets command palette open directly", () => {
    useUIStore.getState().setCommandPaletteOpen(true);
    expect(useUIStore.getState().commandPaletteOpen).toBe(true);
  });

  it("starts with mobile nav closed", () => {
    expect(useUIStore.getState().sidebarMobileOpen).toBe(false);
  });

  it("sets mobile nav open", () => {
    useUIStore.getState().setSidebarMobileOpen(true);
    expect(useUIStore.getState().sidebarMobileOpen).toBe(true);
  });
});
