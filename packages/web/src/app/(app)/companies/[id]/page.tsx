"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CompanyHeader } from "@/components/companies/company-header";
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge";
import { cn } from "@/lib/cn";
import type { CompanySize, ContactStatus, DealStage } from "@relay/shared";

type TabKey = "overview" | "contacts" | "deals";

interface CompanyDetail {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: CompanySize | null;
  createdAt: string;
  updatedAt: string;
  _count: { contacts: number; deals: number };
  contacts: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: ContactStatus;
    owner: { id: string; name: string } | null;
  }[];
  deals: {
    id: string;
    title: string;
    value: number;
    stage: DealStage;
    contact: { id: string; firstName: string; lastName: string } | null;
  }[];
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
  { key: "contacts", label: "Contacts" },
  { key: "deals", label: "Deals" },
];

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const fetchCompany = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/companies/${id}`);
      if (res.ok) {
        const json = await res.json();
        setCompany(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchCompany();
  }, [fetchCompany]);

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

  if (!company) {
    return <p className="py-12 text-center text-sm text-gray-500">Company not found</p>;
  }

  const totalDealValue = company.deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      <CompanyHeader company={company} onUpdated={fetchCompany} />

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
              <DetailRow label="Domain" value={company.domain ?? "—"} />
              <DetailRow label="Industry" value={company.industry ?? "—"} />
              <DetailRow label="Size" value={company.size ?? "—"} />
              <DetailRow label="Contacts" value={String(company._count.contacts)} />
              <DetailRow label="Deals" value={String(company._count.deals)} />
              <DetailRow label="Total Pipeline" value={`$${totalDealValue.toLocaleString()}`} />
              <DetailRow
                label="Added"
                value={new Date(company.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {company.notes.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">No notes yet</p>
              ) : (
                <div className="space-y-3">
                  {company.notes.slice(0, 5).map((note) => (
                    <div key={note.id}>
                      <p className="line-clamp-2 text-sm text-gray-700">{note.content}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {note.user.name} &middot;{" "}
                        {new Date(note.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "contacts" && (
        <Card>
          <CardContent className="pt-6">
            {company.contacts.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No contacts associated with this company
              </p>
            ) : (
              <div className="space-y-2">
                {company.contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => router.push(`/contacts/${contact.id}`)}
                    className="flex w-full items-center justify-between rounded-md border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {contact.firstName} {contact.lastName}
                        </p>
                        <ContactStatusBadge status={contact.status} />
                      </div>
                      <p className="text-xs text-gray-500">{contact.email}</p>
                    </div>
                    {contact.owner && (
                      <p className="text-xs text-gray-400">Owner: {contact.owner.name}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "deals" && (
        <Card>
          <CardContent className="pt-6">
            {company.deals.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No deals associated with this company
              </p>
            ) : (
              <div className="space-y-3">
                {company.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                      <p className="text-xs text-gray-500">
                        {deal.contact
                          ? `${deal.contact.firstName} ${deal.contact.lastName}`
                          : "No contact"}
                      </p>
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
