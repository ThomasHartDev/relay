"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { StageStepper } from "@/components/deals/stage-stepper";
import { EditDealDialog } from "@/components/deals/edit-deal-dialog";
import { LostReasonDialog } from "@/components/deals/lost-reason-dialog";
import { ActivityTimeline, type TimelineActivity } from "@/components/contacts/activity-timeline";
import { formatCurrency } from "@/lib/deals/pipeline-utils";
import { cn } from "@/lib/cn";
import type { DealStage } from "@relay/shared";

type TabKey = "overview" | "activities" | "notes";

interface DealDetail {
  id: string;
  title: string;
  value: number;
  stage: DealStage;
  priority: number;
  closeDate: string | null;
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
  contact: { id: string; firstName: string; lastName: string; email: string } | null;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string; email: string } | null;
  activities: TimelineActivity[];
  notes: {
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    user: { id: string; name: string };
  }[];
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "activities", label: "Activities" },
  { key: "notes", label: "Notes" },
];

export default function DealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [deal, setDeal] = useState<DealDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLostReason, setShowLostReason] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);

  const fetchDeal = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/deals/${id}`);
      if (res.ok) {
        const json = await res.json();
        setDeal(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDeal();
  }, [fetchDeal]);

  async function handleStageChange(stage: DealStage) {
    if (!deal || deal.stage === stage) return;

    if (stage === "LOST") {
      setShowLostReason(true);
      return;
    }

    setIsChangingStage(true);
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      });
      if (res.ok) {
        void fetchDeal();
      }
    } finally {
      setIsChangingStage(false);
    }
  }

  async function handleLostConfirm(reason: string) {
    setIsChangingStage(true);
    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: "LOST", lostReason: reason || undefined }),
      });
      if (res.ok) {
        setShowLostReason(false);
        void fetchDeal();
      }
    } finally {
      setIsChangingStage(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/deals/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/deals");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!deal) {
    return <p className="py-12 text-center text-sm text-gray-500">Deal not found</p>;
  }

  const isOverdue =
    deal.closeDate &&
    new Date(deal.closeDate) < new Date() &&
    deal.stage !== "WON" &&
    deal.stage !== "LOST";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/deals")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pipeline
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.title}</h1>
          <p className="mt-1 text-3xl font-bold text-gray-900">{formatCurrency(deal.value)}</p>
        </div>
        <div className="flex gap-2">
          <EditDealDialog deal={deal} onUpdated={fetchDeal} />
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stage stepper */}
      <div className={cn(isChangingStage && "pointer-events-none opacity-60")}>
        <StageStepper currentStage={deal.stage} onStageChange={handleStageChange} />
      </div>

      {/* Overdue warning */}
      {isOverdue && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Close date was{" "}
          {new Date(deal.closeDate!).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          — this deal is overdue
        </div>
      )}

      {/* Lost reason */}
      {deal.stage === "LOST" && deal.lostReason && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
          <strong>Lost reason:</strong> {deal.lostReason}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Stage" value={deal.stage} />
              <DetailRow label="Value" value={`$${deal.value.toLocaleString()}`} />
              <DetailRow
                label="Contact"
                value={deal.contact ? `${deal.contact.firstName} ${deal.contact.lastName}` : "—"}
              />
              <DetailRow label="Company" value={deal.company?.name ?? "—"} />
              <DetailRow label="Owner" value={deal.owner?.name ?? "—"} />
              <DetailRow
                label="Close Date"
                value={
                  deal.closeDate
                    ? new Date(deal.closeDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <DetailRow
                label="Created"
                value={new Date(deal.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline activities={deal.activities.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "activities" && (
        <Card>
          <CardContent className="pt-6">
            <ActivityTimeline activities={deal.activities} />
          </CardContent>
        </Card>
      )}

      {activeTab === "notes" && (
        <Card>
          <CardContent className="pt-6">
            {deal.notes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No notes yet</p>
            ) : (
              <div className="space-y-4">
                {deal.notes.map((note) => (
                  <div key={note.id}>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">{note.user.name}</span>
                      <span>&middot;</span>
                      <span>
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {note.isPinned && (
                        <Badge variant="warning" className="text-[10px]">
                          Pinned
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{note.content}</p>
                    <Separator className="mt-4" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deal.title}&rdquo;? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" isLoading={isDeleting} onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lost reason dialog */}
      <LostReasonDialog
        open={showLostReason}
        onOpenChange={setShowLostReason}
        onConfirm={handleLostConfirm}
        isSubmitting={isChangingStage}
      />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}
