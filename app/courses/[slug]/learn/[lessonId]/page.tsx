import { CheckCircle2, Circle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { PlayerShell } from "@/features/player/PlayerShell";
import { formatDuration, resumePosition } from "@/lib/course-logic";
import { getCourseDetail, getLessonBookmarks } from "@/lib/queries/learning";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/courses/[slug]/learn/[lessonId]">): Promise<Metadata> {
  const { slug, lessonId } = await params;
  const detail = await getCourseDetail(slug);
  const lesson = detail?.lessons.find((l) => l.id === lessonId);
  return { title: lesson ? `${lesson.title} · ${detail?.course.title}` : "Lesson" };
}

export default async function LessonPage({ params }: PageProps<"/courses/[slug]/learn/[lessonId]">) {
  const { slug, lessonId } = await params;
  const user = await requireUser(`/courses/${slug}/learn/${lessonId}`);
  const isStudent = user.role === "STUDENT";

  const detail = await getCourseDetail(slug, isStudent ? user.id : undefined);
  const lesson = detail?.lessons.find((l) => l.id === lessonId);
  if (!detail || !lesson) notFound();

  const index = detail.lessons.findIndex((l) => l.id === lessonId);
  const following = detail.lessons[index + 1];
  const nextHref = following ? `/courses/${slug}/learn/${following.id}` : `/courses/${slug}/quiz`;
  const nextLabel = following ? `Next: ${following.title}` : "Take the course quiz";
  const bookmarks = isStudent ? await getLessonBookmarks(user.id, lesson.id) : [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <p className="text-sm text-muted">
          <Link href={`/courses/${slug}`} className="hover:underline">
            {detail.course.title}
          </Link>{" "}
          / Lesson {lesson.position}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
        <p className="mt-1 max-w-2xl text-muted">{lesson.summary}</p>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <PlayerShell
            lessonId={lesson.id}
            src={lesson.videoUrl}
            durationSec={lesson.durationSec}
            startAt={resumePosition(lesson.positionSec, lesson.durationSec)}
            chapters={lesson.chapters}
            initialBookmarks={bookmarks}
            saveProgress={isStudent}
            nextHref={nextHref}
            nextLabel={nextLabel}
          />
          <aside aria-label="Course lessons">
            <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
              {detail.lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/courses/${slug}/learn/${l.id}`}
                    aria-current={l.id === lesson.id ? "page" : undefined}
                    className={`flex items-start gap-3 p-3 text-sm hover:bg-surface-muted ${
                      l.id === lesson.id ? "bg-accent-soft font-semibold" : ""
                    }`}
                  >
                    {l.completed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-label="Completed" />
                    ) : (
                      <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-label="Not completed" />
                    )}
                    <span className="flex-1">
                      {l.position}. {l.title}
                    </span>
                    <span className="tabular-nums text-muted">{formatDuration(l.durationSec)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>
    </>
  );
}
