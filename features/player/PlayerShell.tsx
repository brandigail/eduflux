"use client";

import Link from "next/link";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatDuration } from "@/lib/course-logic";
import type { Bookmark, Chapter } from "@/types";
import { BookmarkPanel } from "./BookmarkPanel";
import { ChapterList } from "./ChapterList";

interface PlayerShellProps {
  lessonId: string;
  src: string;
  durationSec: number;
  startAt: number;
  chapters: Chapter[];
  initialBookmarks: Bookmark[];
  /** Instructors preview lessons without saving any progress. */
  saveProgress: boolean;
  nextHref: string;
  nextLabel: string;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const SAVE_EVERY_SEC = 5;

type VideoJsPlayer = ReturnType<typeof videojs>;
type SaveState = "idle" | "saving" | "saved" | "error";

export function PlayerShell(props: PlayerShellProps) {
  const { lessonId, src, startAt, chapters, initialBookmarks, saveProgress, nextHref, nextLabel } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoJsPlayer | null>(null);
  const lastSavedAt = useRef(startAt);
  const [currentSec, setCurrentSec] = useState(Math.floor(startAt));
  const [ended, setEnded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const save = useCallback(
    async (positionSec: number, completed: boolean) => {
      if (!saveProgress) return;
      setSaveState("saving");
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId, positionSec: Math.floor(positionSec), completed }),
          keepalive: true,
        });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    },
    [lessonId, saveProgress],
  );

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    const element = document.createElement("video-js");
    element.classList.add("vjs-big-play-centered");
    host.appendChild(element);

    const player = videojs(element, {
      controls: true,
      fluid: true,
      preload: "metadata",
      playbackRates: SPEEDS,
      sources: [{ src, type: "video/webm" }],
      userActions: { hotkeys: true },
    });
    playerRef.current = player;

    player.ready(() => {
      if (startAt > 0) player.currentTime(startAt);
    });
    player.on("timeupdate", () => {
      const t = player.currentTime() ?? 0;
      setCurrentSec(Math.floor(t));
      if (Math.abs(t - lastSavedAt.current) >= SAVE_EVERY_SEC) {
        lastSavedAt.current = t;
        void save(t, false);
      }
    });
    player.on("pause", () => {
      if (!player.ended()) void save(player.currentTime() ?? 0, false);
    });
    player.on("ended", () => {
      setEnded(true);
      void save(player.duration() ?? 0, true);
    });
    player.on("play", () => setEnded(false));

    const saveOnHide = () => {
      if (document.visibilityState === "hidden" && !player.paused()) void save(player.currentTime() ?? 0, false);
    };
    document.addEventListener("visibilitychange", saveOnHide);

    return () => {
      document.removeEventListener("visibilitychange", saveOnHide);
      player.dispose();
      playerRef.current = null;
    };
  }, [src, startAt, save]);

  const seek = useCallback((sec: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.currentTime(sec);
    void player.play();
  }, []);

  const statusText =
    saveState === "saving" ? "Saving…" : saveState === "saved" ? "Progress saved" : saveState === "error" ? "Could not save progress" : saveProgress ? "" : "Preview mode: progress is not saved";

  return (
    <div className="space-y-4">
      <div ref={containerRef} data-vjs-player className="overflow-hidden rounded-2xl bg-black" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" aria-live="polite" className="min-h-5 text-sm text-muted">
          {statusText}
        </p>
        {ended && (
          <Link
            href={nextHref}
            className="inline-flex h-11 items-center rounded-lg bg-accent px-5 font-semibold text-white hover:bg-accent-strong dark:text-[#0d1020]"
          >
            {nextLabel}
          </Link>
        )}
      </div>
      <p className="text-sm text-muted">
        Position {formatDuration(currentSec)} of {formatDuration(props.durationSec)}. Click the video, then use Space to
        play or pause, arrow keys to seek, and F for full screen.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <ChapterList chapters={chapters} currentSec={currentSec} onSeek={seek} />
        {saveProgress && (
          <BookmarkPanel lessonId={lessonId} initial={initialBookmarks} currentSec={currentSec} onSeek={seek} />
        )}
      </div>
    </div>
  );
}
