"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Globe, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CompanySizeBadge } from "./company-size-badge";
import { EditCompanyDialog } from "./edit-company-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import type { CompanySize } from "@relay/shared";

interface CompanyHeaderProps {
  company: {
    id: string;
    name: string;
    domain: string | null;
    industry: string | null;
    size: CompanySize | null;
    _count: { contacts: number; deals: number };
  };
  onUpdated: () => void;
}

export function CompanyHeader({ company, onUpdated }: CompanyHeaderProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/companies");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const initials = company.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.push("/companies")}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </button>

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              {company.size && <CompanySizeBadge size={company.size} />}
            </div>
            {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              {company.domain && (
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  {company.domain}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {company._count.contacts} contacts &middot; {company._count.deals} deals
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <EditCompanyDialog company={company} onUpdated={onUpdated} />
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {company.name}? This will remove the company but
              contacts and deals will remain unlinked.
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
    </div>
  );
}
