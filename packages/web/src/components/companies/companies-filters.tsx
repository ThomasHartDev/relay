"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { COMPANY_SIZES, type CompanySize } from "@relay/shared";

const SIZE_LABELS: Record<CompanySize, string> = {
  STARTUP: "Startup",
  SMALL: "Small",
  MEDIUM: "Medium",
  ENTERPRISE: "Enterprise",
};

interface CompaniesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sizeFilter: CompanySize | null;
  onSizeFilterChange: (size: CompanySize | null) => void;
}

export function CompaniesFilters({
  search,
  onSearchChange,
  sizeFilter,
  onSizeFilterChange,
}: CompaniesFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search companies..."
          className="pl-9"
        />
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={() => onSizeFilterChange(null)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            sizeFilter === null
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
          )}
        >
          All
        </button>
        {COMPANY_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => onSizeFilterChange(sizeFilter === size ? null : size)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              sizeFilter === size
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {SIZE_LABELS[size]}
          </button>
        ))}
      </div>
    </div>
  );
}
