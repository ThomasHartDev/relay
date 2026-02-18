import { describe, it, expect } from "vitest";
import { SHORTCUTS } from "./use-keyboard-shortcuts";

describe("SHORTCUTS", () => {
  it("has unique keys", () => {
    const keys = SHORTCUTS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has all required navigation shortcuts", () => {
    const navKeys = SHORTCUTS.filter((s) => s.group === "Navigation").map((s) => s.key);
    expect(navKeys).toContain("g c");
    expect(navKeys).toContain("g d");
    expect(navKeys).toContain("g a");
    expect(navKeys).toContain("g w");
    expect(navKeys).toContain("g s");
    expect(navKeys).toContain("g h");
  });

  it("has command palette and help shortcuts in General", () => {
    const generalDescs = SHORTCUTS.filter((s) => s.group === "General").map((s) => s.description);
    expect(generalDescs).toContain("Open command palette");
    expect(generalDescs).toContain("Show keyboard shortcuts");
  });

  it("has a label for every shortcut", () => {
    for (const shortcut of SHORTCUTS) {
      expect(shortcut.label.length).toBeGreaterThan(0);
      expect(shortcut.description.length).toBeGreaterThan(0);
    }
  });
});
