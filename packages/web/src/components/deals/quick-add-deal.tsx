"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DealStage } from "@relay/shared";

interface QuickAddDealProps {
  stage: DealStage;
  onCreated: () => void;
}

export function QuickAddDeal({ stage, onCreated }: QuickAddDealProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get("title") as string,
      value: Number(form.get("value") || 0),
      stage,
    };

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setIsAdding(false);
        onCreated();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Add deal
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input name="title" placeholder="Deal title" required autoFocus className="h-8 text-sm" />
      <Input name="value" type="number" placeholder="Value" min={0} className="h-8 text-sm" />
      <div className="flex gap-1.5">
        <Button type="submit" size="sm" isLoading={isSubmitting} className="h-7 text-xs">
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(false)}
          className="h-7 text-xs"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
