"use client";

import { useState } from "react";
import { Pin, Trash2, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

export interface NoteData {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  user: { id: string; name: string };
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
  deal: { id: string; title: string } | null;
}

interface NoteCardProps {
  note: NoteData;
  onPin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onPin, onDelete }: NoteCardProps) {
  const [showActions, setShowActions] = useState(false);

  const entity = note.contact
    ? `${note.contact.firstName} ${note.contact.lastName}`
    : note.company
      ? note.company.name
      : note.deal
        ? note.deal.title
        : null;

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-4 transition-colors hover:bg-gray-50",
        note.pinned ? "border-amber-200 bg-amber-50/50" : "border-gray-200 bg-white",
      )}
    >
      {/* Pin indicator */}
      {note.pinned && <Pin className="absolute right-3 top-3 h-3.5 w-3.5 text-amber-500" />}

      {/* Content — render markdown-like formatting */}
      <div className="whitespace-pre-wrap text-sm text-gray-700">{renderContent(note.content)}</div>

      {/* Metadata */}
      <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        <span className="font-medium text-gray-500">{note.user.name}</span>
        <span>&middot;</span>
        <span>
          {new Date(note.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        {entity && (
          <>
            <span>&middot;</span>
            <span className="text-gray-500">{entity}</span>
          </>
        )}
      </div>

      {/* Actions dropdown */}
      <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showActions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
              <div className="absolute right-0 z-20 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    onPin(note.id, !note.pinned);
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pin className="h-3.5 w-3.5" />
                  {note.pinned ? "Unpin" : "Pin"}
                </button>
                <button
                  onClick={() => {
                    onDelete(note.id);
                    setShowActions(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Simple markdown-like rendering for bold, italic, and links */
function renderContent(content: string): string {
  // We render as plain text with whitespace preserved
  // Full markdown rendering would add a dependency — keeping it simple for now
  return content;
}
