import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StageStepper } from "./stage-stepper";

describe("StageStepper", () => {
  it("renders all 6 stage buttons", () => {
    render(<StageStepper currentStage="PROSPECT" onStageChange={() => {}} />);
    expect(screen.getByText("Prospect")).toBeTruthy();
    expect(screen.getByText("Qualified")).toBeTruthy();
    expect(screen.getByText("Proposal")).toBeTruthy();
    expect(screen.getByText("Negotiation")).toBeTruthy();
    expect(screen.getByText("Won")).toBeTruthy();
    expect(screen.getByText("Lost")).toBeTruthy();
  });

  it("calls onStageChange when a stage is clicked", () => {
    const onChange = vi.fn();
    render(<StageStepper currentStage="PROSPECT" onStageChange={onChange} />);
    fireEvent.click(screen.getByText("Qualified"));
    expect(onChange).toHaveBeenCalledWith("QUALIFIED");
  });

  it("highlights the current stage with a ring", () => {
    render(<StageStepper currentStage="PROPOSAL" onStageChange={() => {}} />);
    const proposalBtn = screen.getByText("Proposal");
    expect(proposalBtn.className).toContain("ring-2");
  });

  it("applies Won styling for WON stage", () => {
    render(<StageStepper currentStage="WON" onStageChange={() => {}} />);
    const wonBtn = screen.getByText("Won");
    expect(wonBtn.className).toContain("bg-green-100");
    expect(wonBtn.className).toContain("text-green-700");
  });

  it("applies Lost styling for LOST stage", () => {
    render(<StageStepper currentStage="LOST" onStageChange={() => {}} />);
    const lostBtn = screen.getByText("Lost");
    expect(lostBtn.className).toContain("bg-red-100");
    expect(lostBtn.className).toContain("text-red-700");
  });
});
