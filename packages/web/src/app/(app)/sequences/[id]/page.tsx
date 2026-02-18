"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Mail, Clock, GitBranch, Save, BarChart3, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SequenceStatusBadge } from "@/components/sequences/sequence-status-badge";
import { StepCard } from "@/components/sequences/step-card";
import { StepEditor } from "@/components/sequences/step-editor";
import { EnrollmentTable } from "@/components/sequences/enrollment-table";
import { SequenceAnalytics } from "@/components/sequences/sequence-analytics";
import { useSequenceBuilderStore, type BuilderStep } from "@/lib/stores/sequence-builder-store";
import type { SequenceStatus, StepType } from "@relay/shared";

interface SequenceDetail {
  id: string;
  name: string;
  status: SequenceStatus;
  createdAt: string;
  updatedAt: string;
  steps: BuilderStep[];
  _count: { enrollments: number };
}

type TabView = "builder" | "analytics";

export default function SequenceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [sequence, setSequence] = useState<SequenceDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabView>("builder");

  const {
    steps,
    selectedStepId,
    isDirty,
    setSequence: setBuilderSequence,
    selectStep,
    addStep,
    removeStep,
    markClean,
    reset,
  } = useSequenceBuilderStore();

  const selectedStep = steps.find((s) => s.id === selectedStepId) ?? null;

  const fetchSequence = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/sequences/${params.id}`);
      if (res.ok) {
        const json = await res.json();
        const seq = json.data as SequenceDetail;
        setSequence(seq);
        setBuilderSequence(seq.id, seq.steps);
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id, setBuilderSequence]);

  useEffect(() => {
    void fetchSequence();
    return () => reset();
  }, [fetchSequence, reset]);

  function handleAddStep(type: StepType) {
    const tempId = `temp-${Date.now()}`;
    const newStep: BuilderStep = {
      id: tempId,
      type,
      order: steps.length,
      subject: type === "EMAIL" ? "" : null,
      body: type === "EMAIL" ? "" : null,
      delayMs: type === "DELAY" ? 86_400_000 : null,
      conditionType: null,
    };
    addStep(newStep);
  }

  async function handleSave() {
    if (!sequence) return;
    setIsSaving(true);

    try {
      const existingIds = new Set(sequence.steps.map((s) => s.id));

      for (const step of steps) {
        if (step.id.startsWith("temp-")) {
          const res = await fetch(`/api/sequences/${sequence.id}/steps`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(step),
          });
          if (!res.ok) return;
        } else if (existingIds.has(step.id)) {
          await fetch(`/api/sequences/${sequence.id}/steps/${step.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(step),
          });
        }
      }

      const currentIds = new Set(steps.map((s) => s.id));
      for (const orig of sequence.steps) {
        if (!currentIds.has(orig.id)) {
          await fetch(`/api/sequences/${sequence.id}/steps/${orig.id}`, {
            method: "DELETE",
          });
        }
      }

      markClean();
      await fetchSequence();
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!sequence) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Sequence not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/sequences")}>
          Back to Sequences
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => router.push("/sequences")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{sequence.name}</h2>
              <SequenceStatusBadge status={sequence.status} />
            </div>
            <p className="text-xs text-gray-400">
              {sequence._count.enrollments} enrolled &middot; {steps.length} step
              {steps.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {activeTab === "builder" && (
          <Button onClick={handleSave} disabled={!isDirty || isSaving} isLoading={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Tab navigation — Hick's Law: 2 tabs, minimal choice */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "builder"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("builder")}
        >
          <Wrench className="h-3.5 w-3.5" />
          Builder
        </button>
        <button
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "analytics"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Analytics
        </button>
      </div>

      {activeTab === "builder" ? (
        <>
          {/* Split pane — Cognitive Load: overview left, detail right */}
          <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
            {/* Left: Step timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-700">Steps</h3>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => handleAddStep("EMAIL")}
                  >
                    <Mail className="h-3 w-3" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => handleAddStep("DELAY")}
                  >
                    <Clock className="h-3 w-3" />
                    Delay
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => handleAddStep("CONDITION")}
                  >
                    <GitBranch className="h-3 w-3" />
                    Condition
                  </Button>
                </div>
              </div>

              {steps.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-sm text-gray-400">No steps yet</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Add an email, delay, or condition step to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div>
                  {steps.map((step, i) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      isSelected={step.id === selectedStepId}
                      isLast={i === steps.length - 1}
                      onSelect={() => selectStep(step.id)}
                      onRemove={() => removeStep(step.id)}
                    />
                  ))}
                </div>
              )}

              {steps.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleAddStep("EMAIL")}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add Step
                </Button>
              )}
            </div>

            {/* Right: Step editor */}
            <Card>
              <CardContent className="p-5">
                {selectedStep ? (
                  <StepEditor step={selectedStep} />
                ) : (
                  <div className="flex h-64 items-center justify-center">
                    <p className="text-sm text-gray-400">Select a step to edit its configuration</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enrollments section */}
          <EnrollmentTable sequenceId={sequence.id} />
        </>
      ) : (
        <SequenceAnalytics sequenceId={sequence.id} />
      )}
    </div>
  );
}
