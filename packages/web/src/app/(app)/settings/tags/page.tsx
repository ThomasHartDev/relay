"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2, Tags } from "lucide-react";
import { TAG_COLORS } from "@relay/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Tag {
  id: string;
  name: string;
  color: string;
  _count: { contacts: number; deals: number };
}

export default function TagsSettingsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tags");
      if (res.ok) {
        const json = await res.json();
        setTags(json.data);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          color: form.get("color"),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to create tag");
      }

      setCreateOpen(false);
      void fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTag) return;
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/tags/${editTag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          color: form.get("color"),
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to update tag");
      }

      setEditTag(null);
      void fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    setTags((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    void fetchTags();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
          <p className="text-sm text-gray-500">Manage tags for contacts and deals</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Tag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input name="name" placeholder="Tag name" required />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color, i) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        defaultChecked={i === 0}
                        className="peer sr-only"
                      />
                      <span
                        className="block h-8 w-8 rounded-full ring-2 ring-transparent ring-offset-2 peer-checked:ring-gray-900"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!isLoading && tags.length === 0 ? (
        <EmptyState
          icon={<Tags className="h-12 w-12" />}
          title="No tags yet"
          description="Create your first tag to start organizing contacts and deals."
          action={<Button onClick={() => setCreateOpen(true)}>Create Tag</Button>}
        />
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {tags.map((tag) => (
            <div key={tag.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full" style={{ backgroundColor: tag.color }} />
                <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                <span className="text-xs text-gray-400">
                  {tag._count.contacts} contact{tag._count.contacts !== 1 ? "s" : ""},{" "}
                  {tag._count.deals} deal{tag._count.deals !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setError(null);
                    setEditTag(tag);
                  }}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => void handleDelete(tag.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editTag} onOpenChange={(open) => !open && setEditTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
          </DialogHeader>
          {editTag && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <Input name="name" placeholder="Tag name" defaultValue={editTag.name} required />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Color</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((color) => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        defaultChecked={color === editTag.color}
                        className="peer sr-only"
                      />
                      <span
                        className="block h-8 w-8 rounded-full ring-2 ring-transparent ring-offset-2 peer-checked:ring-gray-900"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTag(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
