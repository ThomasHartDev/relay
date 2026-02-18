"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ContactHeader } from "@/components/contacts/contact-header";
import { ActivityTimeline, type TimelineActivity } from "@/components/contacts/activity-timeline";
import type { ContactStatus } from "@relay/shared";
import type { DealStage } from "@relay/shared";
import { cn } from "@/lib/cn";

type TabKey = "overview" | "activities" | "deals" | "notes";

interface ContactDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string; domain: string | null } | null;
  owner: { id: string; name: string; email: string } | null;
  activities: TimelineActivity[];
  deals: {
    id: string;
    title: string;
    value: number;
    stage: DealStage;
    company: { id: string; name: string } | null;
  }[];
  notes: {
    id: string;
    content: string;
    isPinned: boolean;
    createdAt: string;
    user: { id: string; name: string };
  }[];
  tags: { tag: { id: string; name: string; color: string } }[];
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "activities", label: "Activities" },
  { key: "deals", label: "Deals" },
  { key: "notes", label: "Notes" },
];

export default function ContactDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const fetchContact = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (res.ok) {
        const json = await res.json();
        setContact(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchContact();
  }, [fetchContact]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contact) {
    return <p className="py-12 text-center text-sm text-gray-500">Contact not found</p>;
  }

  return (
    <div className="space-y-6">
      <ContactHeader contact={contact} onUpdated={fetchContact} />

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {contact.tags.map(({ tag }) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </Badge>
          ))}
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
              <DetailRow label="Email" value={contact.email} />
              <DetailRow label="Phone" value={contact.phone ?? "—"} />
              <DetailRow label="Title" value={contact.title ?? "—"} />
              <DetailRow label="Company" value={contact.company?.name ?? "—"} />
              <DetailRow label="Owner" value={contact.owner?.name ?? "—"} />
              <DetailRow
                label="Added"
                value={new Date(contact.createdAt).toLocaleDateString("en-US", {
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
              <ActivityTimeline activities={contact.activities.slice(0, 5)} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "activities" && (
        <Card>
          <CardContent className="pt-6">
            <ActivityTimeline activities={contact.activities} />
          </CardContent>
        </Card>
      )}

      {activeTab === "deals" && (
        <Card>
          <CardContent className="pt-6">
            {contact.deals.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No deals associated</p>
            ) : (
              <div className="space-y-3">
                {contact.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <p className="text-xs text-gray-500">{deal.company?.name ?? "No company"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${deal.value.toLocaleString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {deal.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "notes" && (
        <Card>
          <CardContent className="pt-6">
            {contact.notes.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No notes yet</p>
            ) : (
              <div className="space-y-4">
                {contact.notes.map((note) => (
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
