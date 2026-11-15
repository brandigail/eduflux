import { formatDuration } from "@/lib/course-logic";
import type { Chapter } from "@/types";

interface ChapterListProps {
  chapters: Chapter[];
  currentSec: number;
  onSeek: (sec: number) => void;
}

/** Index of the chapter containing `sec`, or -1 before the first chapter. */
export function activeChapterIndex(chapters: readonly Chapter[], sec: number): number {
  let active = -1;
  chapters.forEach((c, i) => {
    if (sec >= c.at) active = i;
  });
  return active;
}

export function ChapterList({ chapters, currentSec, onSeek }: ChapterListProps) {
  const active = activeChapterIndex(chapters, currentSec);
  return (
    <section aria-labelledby="chapters" className="rounded-2xl border border-border bg-surface p-4">
      <h2 id="chapters" className="font-semibold">
        Chapters
      </h2>
      <ol className="mt-3 space-y-1">
        {chapters.map((chapter, i) => (
          <li key={chapter.at}>
            <button
              type="button"
              onClick={() => onSeek(chapter.at)}
              aria-current={i === active ? "true" : undefined}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm hover:bg-surface-muted ${
                i === active ? "bg-accent-soft font-semibold text-accent" : ""
              }`}
            >
              <span className="w-10 tabular-nums text-muted">{formatDuration(chapter.at)}</span>
              {chapter.title}
            </button>
          </li>
        ))}
      </ol>
    </section>
  );
}
