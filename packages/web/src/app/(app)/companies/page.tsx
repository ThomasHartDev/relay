"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { CompanySizeBadge } from "@/components/companies/company-size-badge";
import { CompaniesFilters } from "@/components/companies/companies-filters";
import { QuickAddCompany } from "@/components/companies/quick-add-company";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { CompanySize } from "@relay/shared";

interface CompanyRow {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: CompanySize | null;
  createdAt: string;
  _count: { contacts: number; deals: number };
}

interface CompaniesResponse {
  data: CompanyRow[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState<CompanySize | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (sizeFilter) params.set("size", sizeFilter);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/companies?${params.toString()}`);
      if (res.ok) {
        const json: CompaniesResponse = await res.json();
        setCompanies(json.data);
        setMeta(json.meta);
      }
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, sizeFilter, page]);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sizeFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <QuickAddCompany onCreated={fetchCompanies} />
      </div>

      <CompaniesFilters
        search={search}
        onSearchChange={setSearch}
        sizeFilter={sizeFilter}
        onSizeFilterChange={setSizeFilter}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<Building2 className="h-8 w-8" />}
          title="No companies found"
          description={
            debouncedSearch || sizeFilter
              ? "Try adjusting your filters"
              : "Add your first company to get started"
          }
        />
      ) : (
        <>
          <div className="space-y-2">
            {companies.map((company) => {
              const initials = company.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")
                .toUpperCase();

              return (
                <button
                  key={company.id}
                  onClick={() => router.push(`/companies/${company.id}`)}
                  className="flex w-full items-center gap-4 rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-gray-900">{company.name}</p>
                      {company.size && <CompanySizeBadge size={company.size} />}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                      {company.domain && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {company.domain}
                        </span>
                      )}
                      {company.industry && <span>{company.industry}</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{company._count.contacts} contacts</p>
                    <p>{company._count.deals} deals</p>
                  </div>
                </button>
              );
            })}
          </div>

          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">
                Showing {(meta.page - 1) * 25 + 1}-{Math.min(meta.page * 25, meta.total)} of{" "}
                {meta.total}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
