"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Braces } from "lucide-react";

const MERGE_TAGS = [
  { tag: "{{firstName}}", label: "First Name" },
  { tag: "{{lastName}}", label: "Last Name" },
  { tag: "{{email}}", label: "Email" },
  { tag: "{{company}}", label: "Company" },
  { tag: "{{title}}", label: "Job Title" },
] as const;

interface MergeTagPickerProps {
  onSelect: (tag: string) => void;
}

export function MergeTagPicker({ onSelect }: MergeTagPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs text-gray-500">
          <Braces className="h-3.5 w-3.5" />
          Merge Tags
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {MERGE_TAGS.map((mt) => (
          <DropdownMenuItem
            key={mt.tag}
            onClick={() => {
              onSelect(mt.tag);
              setOpen(false);
            }}
          >
            <code className="mr-2 text-xs text-blue-600">{mt.tag}</code>
            <span className="text-xs text-gray-500">{mt.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
