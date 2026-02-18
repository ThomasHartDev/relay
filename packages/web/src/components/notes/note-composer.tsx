"use client";

import { useState } from "react";
import { Bold, Italic, Link, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteComposerProps {
  entityType?: "contact" | "company" | "deal";
  entityId?: string;
  onCreated: () => void;
}

/**
 * Minimal rich text note composer — bold, italic, link, list via markdown shortcuts.
 * Cognitive Load Theory: no complex WYSIWYG, just essentials.
 */
export function NoteComposer({ entityType, entityId, onCreated }: NoteComposerProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim()) return;

    setError(null);
    setIsSubmitting(true);

    const data: Record<string, unknown> = { content: content.trim() };
    if (entityType && entityId) {
      data[`${entityType}Id`] = entityId;
    }

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to save note");
      }

      setContent("");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function insertMarkdown(prefix: string, suffix: string) {
    const textarea = document.getElementById("note-textarea") as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end);

    const newContent = content.slice(0, start) + prefix + selected + suffix + content.slice(end);
    setContent(newContent);

    // Restore cursor position after the inserted text
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + prefix.length + selected.length + suffix.length;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-3 py-1.5">
        <button
          type="button"
          onClick={() => insertMarkdown("**", "**")}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("*", "*")}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("[", "](url)")}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="Link"
        >
          <Link className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => insertMarkdown("\n- ", "")}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          title="List"
        >
          <List className="h-4 w-4" />
        </button>
      </div>

      {/* Textarea */}
      <textarea
        id="note-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a note..."
        className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        rows={3}
      />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <div>{error && <p className="text-xs text-red-600">{error}</p>}</div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          isLoading={isSubmitting}
        >
          Save Note
        </Button>
      </div>
    </div>
  );
}
