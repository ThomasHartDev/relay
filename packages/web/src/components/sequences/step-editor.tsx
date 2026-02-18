"use client";

import { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MergeTagPicker } from "./merge-tag-picker";
import { useSequenceBuilderStore, type BuilderStep } from "@/lib/stores/sequence-builder-store";

interface StepEditorProps {
  step: BuilderStep;
}

export function StepEditor({ step }: StepEditorProps) {
  const updateStep = useSequenceBuilderStore((s) => s.updateStep);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  function handleMergeTag(tag: string) {
    const textarea = bodyRef.current;
    if (!textarea) {
      updateStep(step.id, { body: (step.body ?? "") + tag });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = step.body ?? "";
    const newBody = current.slice(0, start) + tag + current.slice(end);
    updateStep(step.id, { body: newBody });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    });
  }

  if (step.type === "EMAIL") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Email Step</h3>

        <div>
          <label htmlFor="step-subject" className="mb-1.5 block text-xs font-medium text-gray-600">
            Subject Line
          </label>
          <Input
            id="step-subject"
            value={step.subject ?? ""}
            onChange={(e) => updateStep(step.id, { subject: e.target.value })}
            placeholder="e.g. Welcome to {{company}}!"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="step-body" className="text-xs font-medium text-gray-600">
              Email Body
            </label>
            <MergeTagPicker onSelect={handleMergeTag} />
          </div>
          <Textarea
            id="step-body"
            ref={bodyRef}
            value={step.body ?? ""}
            onChange={(e) => updateStep(step.id, { body: e.target.value })}
            placeholder="Write your email content here..."
            rows={10}
          />
        </div>
      </div>
    );
  }

  if (step.type === "DELAY") {
    const totalMs = step.delayMs ?? 0;
    const totalHours = Math.floor(totalMs / 3_600_000);
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    function setDelay(d: number, h: number) {
      updateStep(step.id, { delayMs: (d * 24 + h) * 3_600_000 });
    }

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Delay Step</h3>
        <p className="text-xs text-gray-500">
          Wait before executing the next step in the sequence.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="delay-days" className="mb-1.5 block text-xs font-medium text-gray-600">
              Days
            </label>
            <Input
              id="delay-days"
              type="number"
              min={0}
              max={365}
              value={days}
              onChange={(e) => setDelay(Number(e.target.value), hours)}
            />
          </div>
          <div>
            <label htmlFor="delay-hours" className="mb-1.5 block text-xs font-medium text-gray-600">
              Hours
            </label>
            <Input
              id="delay-hours"
              type="number"
              min={0}
              max={23}
              value={hours}
              onChange={(e) => setDelay(days, Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step.type === "CONDITION") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Condition Step</h3>
        <p className="text-xs text-gray-500">
          Check a condition before continuing to the next step.
        </p>

        <div>
          <label
            htmlFor="condition-type"
            className="mb-1.5 block text-xs font-medium text-gray-600"
          >
            If contact has...
          </label>
          <Select
            value={step.conditionType ?? ""}
            onValueChange={(v) =>
              updateStep(step.id, { conditionType: v as "OPENED" | "CLICKED" | "REPLIED" })
            }
          >
            <SelectTrigger id="condition-type">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPENED">Opened the email</SelectItem>
              <SelectItem value="CLICKED">Clicked a link</SelectItem>
              <SelectItem value="REPLIED">Replied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  return null;
}
