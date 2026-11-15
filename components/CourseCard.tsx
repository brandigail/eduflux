import { Award, Clock, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { courseStatus, formatDuration } from "@/lib/course-logic";
import type { CourseSummary } from "@/types";
import { ProgressBar } from "./ProgressBar";

export function CourseCard({ course }: { course: CourseSummary }) {
  const showProgress = course.completedLessons !== undefined;
  const status = courseStatus(course.lessonCount, course.completedLessons ?? 0);
  const started = showProgress && status.lessonsDone > 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <Image
        src={course.thumbnail}
        alt=""
        width={640}
        height={360}
        className="aspect-video w-full object-cover"
        unoptimized
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">{course.level}</span>
          {course.hasCertificate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-success">
              <Award className="h-3.5 w-3.5" aria-hidden /> Certified
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold leading-snug text-foreground">
          <Link href={`/courses/${course.slug}`} className="after:absolute after:inset-0 hover:underline">
            {course.title}
          </Link>
        </h3>
        <p className="text-sm text-muted">{course.description}</p>
        <p className="mt-auto flex items-center gap-4 pt-2 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-4 w-4" aria-hidden /> {course.lessonCount} lessons
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden /> {formatDuration(course.totalDurationSec)}
          </span>
        </p>
        <p className="text-xs text-muted">With {course.instructorName}</p>
        {showProgress && (
          <div className="space-y-1">
            <ProgressBar percent={status.percent} label={`${course.title} progress`} />
            <p className="text-xs text-muted">
              {started ? `${status.lessonsDone} of ${status.lessonCount} lessons done` : "Not started"}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
