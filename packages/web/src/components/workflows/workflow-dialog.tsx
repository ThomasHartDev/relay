"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WORKFLOW_TRIGGER_TYPES,
  WORKFLOW_TRIGGER_LABELS,
  type WorkflowTriggerType,
} from "@relay/shared";

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  workflow?: {
    id: string;
    name: string;
    description: string | null;
    triggerType: WorkflowTriggerType | null;
  } | null;
}

export function WorkflowDialog({ open, onOpenChange, onSaved, workflow }: WorkflowDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<WorkflowTriggerType | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = Boolean(workflow);

  useEffect(() => {
    if (open) {
      setName(workflow?.name ?? "");
      setDescription(workflow?.description ?? "");
      setTriggerType(workflow?.triggerType ?? "");
      setError(null);
    }
  }, [open, workflow]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = { name: name.trim() };
      if (description.trim()) payload.description = description.trim();
      if (triggerType) payload.triggerType = triggerType;

      const url = isEdit ? `/api/workflows/${workflow!.id}` : "/api/workflows";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save workflow");
      }

      onOpenChange(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Workflow" : "New Workflow"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
            <Input
              placeholder="e.g., Lead Nurture Flow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <Input
              placeholder="Brief description of what this workflow does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Trigger <span className="text-gray-400">(optional)</span>
            </label>
            <Select
              value={triggerType}
              onValueChange={(val) => setTriggerType(val as WorkflowTriggerType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a trigger..." />
              </SelectTrigger>
              <SelectContent>
                {WORKFLOW_TRIGGER_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {WORKFLOW_TRIGGER_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()} isLoading={isSubmitting}>
            {isEdit ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
