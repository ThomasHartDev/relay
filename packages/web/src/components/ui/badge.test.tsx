import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("bg-brand-100");
  });

  it("renders success variant", () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText("Active");
    expect(badge.className).toContain("bg-green-50");
    expect(badge.className).toContain("text-green-700");
  });

  it("renders destructive variant", () => {
    render(<Badge variant="destructive">Churned</Badge>);
    const badge = screen.getByText("Churned");
    expect(badge.className).toContain("bg-red-50");
    expect(badge.className).toContain("text-red-700");
  });

  it("renders warning variant", () => {
    render(<Badge variant="warning">Pending</Badge>);
    const badge = screen.getByText("Pending");
    expect(badge.className).toContain("bg-amber-50");
    expect(badge.className).toContain("text-amber-700");
  });

  it("renders secondary variant", () => {
    render(<Badge variant="secondary">Draft</Badge>);
    const badge = screen.getByText("Draft");
    expect(badge.className).toContain("bg-gray-100");
  });

  it("applies custom className", () => {
    render(<Badge className="ml-2">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge.className).toContain("ml-2");
  });

  it("has consistent pill shape across variants", () => {
    const { container } = render(
      <>
        <Badge variant="default">A</Badge>
        <Badge variant="success">B</Badge>
        <Badge variant="destructive">C</Badge>
      </>,
    );
    const badges = container.querySelectorAll("span");
    badges.forEach((badge) => {
      expect(badge.className).toContain("rounded-full");
      expect(badge.className).toContain("px-2.5");
      expect(badge.className).toContain("text-xs");
    });
  });
});
