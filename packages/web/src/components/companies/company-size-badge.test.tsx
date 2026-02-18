import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanySizeBadge } from "./company-size-badge";
import type { CompanySize } from "@relay/shared";

const SIZES: CompanySize[] = ["STARTUP", "SMALL", "MEDIUM", "ENTERPRISE"];

describe("CompanySizeBadge", () => {
  it.each(SIZES)("renders label for %s", (size) => {
    render(<CompanySizeBadge size={size} />);
    const expected: Record<CompanySize, string> = {
      STARTUP: "Startup",
      SMALL: "Small",
      MEDIUM: "Medium",
      ENTERPRISE: "Enterprise",
    };
    expect(screen.getByText(expected[size])).toBeTruthy();
  });

  it("applies distinct background colors for each size", () => {
    const colors = new Set<string>();
    for (const size of SIZES) {
      const { unmount } = render(<CompanySizeBadge size={size} />);
      const badge = screen.getByText(
        size === "STARTUP"
          ? "Startup"
          : size === "SMALL"
            ? "Small"
            : size === "MEDIUM"
              ? "Medium"
              : "Enterprise",
      );
      const bg = badge.style.backgroundColor;
      colors.add(bg);
      unmount();
    }
    expect(colors.size).toBe(4);
  });

  it("renders as a badge with outline variant styling", () => {
    render(<CompanySizeBadge size="ENTERPRISE" />);
    const badge = screen.getByText("Enterprise");
    expect(badge.className).toContain("text-xs");
  });
});
