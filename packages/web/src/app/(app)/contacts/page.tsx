"use client";

import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Download, Upload } from "lucide-react";
import { type ContactStatus } from "@relay/shared";
import { DataTable, type Column } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ContactStatusBadge } from "@/components/contacts/contact-status-badge";
import { ContactsFilters } from "@/components/contacts/contacts-filters";
import { QuickAddContact } from "@/components/contacts/quick-add-contact";
import { useDebounce } from "@/lib/hooks/use-debounce";

// Lazy load import wizard — includes CSV parsing library
const ImportWizard = lazy(() =>
  import("@/components/contacts/import-wizard").then((m) => ({ default: m.ImportWizard })),
);

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  title: string | null;
  status: ContactStatus;
  createdAt: string;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
}

interface ContactsResponse {
  data: Contact[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const PAGE_SIZE = 25;

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | null>(null);
  const [page, setPage] = useState(1);

  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/contacts?${params.toString()}`);
      if (res.ok) {
        const json: ContactsResponse = await res.json();
        setContacts(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    void fetchContacts();
  }, [fetchContacts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const columns: Column<Contact>[] = [
    {
      key: "name",
      header: "Name",
      render: (contact) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {contact.firstName[0]}
              {contact.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </p>
            {contact.title && <p className="text-xs text-gray-500">{contact.title}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      render: (contact) => <span className="text-sm text-gray-600">{contact.email}</span>,
    },
    {
      key: "company",
      header: "Company",
      render: (contact) => (
        <span className="text-sm text-gray-600">{contact.company?.name ?? "—"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (contact) => <ContactStatusBadge status={contact.status} />,
    },
    {
      key: "owner",
      header: "Owner",
      render: (contact) => (
        <span className="text-sm text-gray-600">{contact.owner?.name ?? "—"}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Added",
      sortable: true,
      render: (contact) => (
        <span className="text-sm text-gray-500">
          {new Date(contact.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/contacts/export");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contacts-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setExporting(false);
    }
  }

  const isEmpty = !isLoading && contacts.length === 0 && !debouncedSearch && !statusFilter;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              {meta.total} contact{meta.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
            disabled={exporting || meta.total === 0}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import
          </Button>
          <QuickAddContact onCreated={fetchContacts} />
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No contacts yet"
          description="Get started by adding your first contact."
          action={<QuickAddContact onCreated={fetchContacts} />}
        />
      ) : (
        <>
          <ContactsFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />

          <DataTable
            columns={columns}
            data={contacts}
            keyExtractor={(c) => c.id}
            isLoading={isLoading}
            skeletonRows={PAGE_SIZE}
            onRowClick={(contact) => router.push(`/contacts/${contact.id}`)}
            emptyMessage="No contacts match your filters"
          />

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {importOpen && (
        <Suspense fallback={null}>
          <ImportWizard
            open={importOpen}
            onOpenChange={setImportOpen}
            onComplete={() => void fetchContacts()}
          />
        </Suspense>
      )}
    </div>
  );
}
