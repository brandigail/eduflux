"use client";

import { Bookmark as BookmarkIcon, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { formatDuration } from "@/lib/course-logic";
import type { Bookmark } from "@/types";

interface BookmarkPanelProps {
  lessonId: string;
  initial: Bookmark[];
  currentSec: number;
  onSeek: (sec: number) => void;
}

export function BookmarkPanel({ lessonId, initial, currentSec, onSeek }: BookmarkPanelProps) {
  const [items, setItems] = useState<Bookmark[]>(initial);
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(event: FormEvent) {
    event.preventDefault();
    const text = label.trim() || `Bookmark at ${formatDuration(currentSec)}`;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, atSec: currentSec, label: text }),
      });
      const body: { bookmark?: Bookmark; error?: string } = await res.json();
      if (!res.ok || !body.bookmark) {
        setError(body.error ?? "Could not save the bookmark.");
        return;
      }
      const created = body.bookmark;
      setItems((prev) => [...prev, created].sort((a, b) => a.atSec - b.atSec));
      setLabel("");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    const before = items;
    setItems((prev) => prev.filter((b) => b.id !== id));
    try {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) setItems(before);
    } catch {
      setItems(before);
    }
  }

  return (
    <section aria-labelledby="bookmarks" className="rounded-2xl border border-border bg-surface p-4">
      <h2 id="bookmarks" className="flex items-center gap-2 font-semibold">
        <BookmarkIcon className="h-4 w-4 text-accent" aria-hidden /> Bookmarks
      </h2>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <label htmlFor="bookmark-label" className="sr-only">
          Bookmark label
        </label>
        <input
          id="bookmark-label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={80}
          placeholder={`Note at ${formatDuration(currentSec)}`}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-11 shrink-0 rounded-lg border border-border px-4 text-sm font-medium hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Pause the video and add a note to find this moment again.</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {items.map((b) => (
            <li key={b.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSeek(b.atSec)}
                className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-surface-muted"
              >
                <span className="w-10 shrink-0 tabular-nums text-muted">{formatDuration(b.atSec)}</span>
                <span className="truncate">{b.label}</span>
              </button>
              <button
                type="button"
                onClick={() => void remove(b.id)}
                aria-label={`Delete bookmark ${b.label}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-muted hover:text-danger"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
