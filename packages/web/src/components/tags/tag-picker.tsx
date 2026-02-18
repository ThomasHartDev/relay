"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { X, Plus, Check } from "lucide-react";
import { TAG_COLORS } from "@relay/shared";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface TagPickerProps {
  entityType: "contact" | "deal";
  entityId: string;
  selectedTags: Tag[];
  onTagsChange: () => void;
}

export function TagPicker({ entityType, entityId, selectedTags, onTagsChange }: TagPickerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchTags = useCallback(async () => {
    const res = await fetch("/api/tags");
    if (res.ok) {
      const json = await res.json();
      setAllTags(json.data);
    }
  }, []);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedIds = new Set(selectedTags.map((t) => t.id));

  const filtered = allTags.filter(
    (tag) => !search || tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  const showCreateOption =
    search.trim() && !allTags.some((t) => t.name.toLowerCase() === search.trim().toLowerCase());

  async function handleToggleTag(tagId: string) {
    const isSelected = selectedIds.has(tagId);
    const endpoint = `/api/${entityType}s/${entityId}`;

    // Build the tag association/disassociation payload
    const currentTagIds = selectedTags.map((t) => t.id);
    const newTagIds = isSelected
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tags: newTagIds.map((id) => ({ tagId: id })),
      }),
    });

    onTagsChange();
  }

  async function handleCreateTag() {
    if (!search.trim() || isCreating) return;
    setIsCreating(true);

    const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: search.trim(), color: randomColor }),
      });

      if (res.ok) {
        const json = await res.json();
        await fetchTags();
        await handleToggleTag(json.data.id);
        setSearch("");
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selected tags + input */}
      <div
        className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1.5 transition-colors focus-within:border-gray-400"
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selectedTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleToggleTag(tag.id);
              }}
              className="rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
          className="min-w-[80px] flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {filtered.map((tag) => {
            const isSelected = selectedIds.has(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => void handleToggleTag(tag.id)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-gray-50"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 text-gray-700">{tag.name}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-gray-500" />}
              </button>
            );
          })}

          {showCreateOption && (
            <button
              onClick={() => void handleCreateTag()}
              disabled={isCreating}
              className="flex w-full items-center gap-2 border-t border-gray-100 px-3 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Create &ldquo;{search.trim()}&rdquo;
            </button>
          )}

          {filtered.length === 0 && !showCreateOption && (
            <p className="px-3 py-2 text-xs text-gray-400">No tags found</p>
          )}
        </div>
      )}
    </div>
  );
}
