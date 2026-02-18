"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CONTACT_STATUSES, type ContactStatus } from "@relay/shared";
import { cn } from "@/lib/cn";

const STATUS_LABELS: Record<ContactStatus, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CUSTOMER: "Customer",
  CHURNED: "Churned",
  ARCHIVED: "Archived",
};

interface ContactsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContactStatus | null;
  onStatusFilterChange: (status: ContactStatus | null) => void;
}

export function ContactsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ContactsFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search contacts..."
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusFilterChange(null)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            statusFilter === null
              ? "bg-brand-100 text-brand-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          All
        </button>
        {CONTACT_STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => onStatusFilterChange(statusFilter === status ? null : status)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              statusFilter === status
                ? "bg-brand-100 text-brand-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
      </div>
    </div>
  );
}
