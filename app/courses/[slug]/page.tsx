import { Award, CheckCircle2, Circle, ClipboardCheck, PlayCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgressBar } from "@/components/ProgressBar";
import { SiteHeader } from "@/components/SiteHeader";
import { formatDuration } from "@/lib/course-logic";
import { getCourseDetail } from "@/lib/queries/learning";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/courses/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getCourseDetail(slug);
  return { title: detail?.course.title ?? "Course" };
}

export default async function CoursePage({ params }: PageProps<"/courses/[slug]">) {
  const { slug } = await params;
  const user = await getSessionUser();
  const detail = await getCourseDetail(slug, user?.role === "STUDENT" ? user.id : undefined);
  if (!detail) notFound();

  const { course, lessons, status, quiz, attempts, hasPassed, certificate } = detail;
  const next = lessons.find((l) => !l.completed) ?? lessons[0];
  const started = status.lessonsDone > 0 || lessons.some((l) => l.positionSec > 0);
  const best = attempts.reduce((max, a) => Math.max(max, a.score), 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <p className="text-sm text-muted">
          <Link href="/" className="hover:underline">
            Courses
          </Link>{" "}
          / {course.level}
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">{course.title}</h1>
        <p className="mt-3 max-w-2xl text-muted">{course.description}</p>
        <p className="mt-2 text-sm text-muted">With {course.instructorName}</p>

        {user?.role === "STUDENT" ? (
          <div className="mt-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            <ProgressBar percent={status.percent} label="Course progress" />
            <p className="text-sm text-muted">
              {status.lessonsDone} of {status.lessonCount} lessons done
            </p>
            {next && (
              <Link
                href={`/courses/${course.slug}/learn/${next.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-accent px-5 font-semibold text-white hover:bg-accent-strong dark:text-[#0d1020]"
              >
                <PlayCircle className="h-5 w-5" aria-hidden />
                {status.allLessonsDone ? "Rewatch" : started ? "Continue" : "Start course"}
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">
              {user ? "Instructors can preview courses but progress is for students." : "Sign in to track progress and earn a certificate."}
            </p>
            <Link
              href={user && next ? `/courses/${course.slug}/learn/${next.id}` : `/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`}
              className="mt-3 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-semibold text-white hover:bg-accent-strong dark:text-[#0d1020]"
            >
              {user ? "Preview first lesson" : "Sign in to start"}
            </Link>
          </div>
        )}

        <h2 className="mt-10 text-xl font-bold">Lessons</h2>
        <ol className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={user ? `/courses/${course.slug}/learn/${lesson.id}` : `/login?next=${encodeURIComponent(`/courses/${course.slug}/learn/${lesson.id}`)}`}
                className="flex items-start gap-3 p-4 hover:bg-surface-muted"
              >
                {lesson.completed ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-label="Completed" />
                ) : (
                  <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-label="Not completed" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {lesson.position}. {lesson.title}
                  </p>
                  <p className="text-sm text-muted">{lesson.summary}</p>
                </div>
                <span className="text-sm tabular-nums text-muted">{formatDuration(lesson.durationSec)}</span>
              </Link>
            </li>
          ))}
        </ol>

        {quiz && (
          <section aria-labelledby="quiz" className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 id="quiz" className="flex items-center gap-2 text-lg font-bold">
                <ClipboardCheck className="h-5 w-5 text-accent" aria-hidden /> Course quiz
              </h2>
              <p className="mt-2 text-sm text-muted">
                {quiz.questionCount} questions, pass mark {quiz.passMark}%.
                {attempts.length > 0 && ` ${attempts.length} attempt${attempts.length === 1 ? "" : "s"}, best ${best}%.`}
              </p>
              <Link
                href={user ? `/courses/${course.slug}/quiz` : `/login?next=${encodeURIComponent(`/courses/${course.slug}/quiz`)}`}
                className="mt-4 inline-flex h-11 items-center rounded-lg border border-border px-5 font-medium hover:bg-surface-muted"
              >
                {attempts.length > 0 ? "Retake quiz" : "Take quiz"}
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <Award className="h-5 w-5 text-accent" aria-hidden /> Certificate
              </h2>
              {certificate ? (
                <>
                  <p className="mt-2 text-sm text-muted">
                    Earned on {certificate.issuedAt.toLocaleDateString("en-GB", { dateStyle: "long" })}.
                  </p>
                  <a
                    href={`/api/certificate/${course.id}`}
                    className="mt-4 inline-flex h-11 items-center rounded-lg bg-accent px-5 font-semibold text-white hover:bg-accent-strong dark:text-[#0d1020]"
                  >
                    Download PDF
                  </a>
                </>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  <li className="flex items-center gap-2">
                    {status.allLessonsDone ? <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                    Watch every lesson
                  </li>
                  <li className="flex items-center gap-2">
                    {hasPassed ? <CheckCircle2 className="h-4 w-4 text-success" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                    Pass the quiz ({quiz.passMark}%)
                  </li>
                </ul>
              )}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
