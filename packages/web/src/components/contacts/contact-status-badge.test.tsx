import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactStatusBadge } from "./contact-status-badge";
import type { ContactStatus } from "@relay/shared";

describe("ContactStatusBadge", () => {
  const statusLabels: Record<ContactStatus, string> = {
    LEAD: "Lead",
    PROSPECT: "Prospect",
    CUSTOMER: "Customer",
    CHURNED: "Churned",
    ARCHIVED: "Archived",
  };

  it.each(Object.entries(statusLabels))("renders %s status with correct label", (status, label) => {
    render(<ContactStatusBadge status={status as ContactStatus} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("renders Customer with success variant (green)", () => {
    render(<ContactStatusBadge status="CUSTOMER" />);
    const badge = screen.getByText("Customer");
    expect(badge.className).toContain("bg-green-50");
  });

  it("renders Churned with destructive variant (red)", () => {
    render(<ContactStatusBadge status="CHURNED" />);
    const badge = screen.getByText("Churned");
    expect(badge.className).toContain("bg-red-50");
  });

  it("renders Lead with default variant (brand)", () => {
    render(<ContactStatusBadge status="LEAD" />);
    const badge = screen.getByText("Lead");
    expect(badge.className).toContain("bg-brand-100");
  });
});
