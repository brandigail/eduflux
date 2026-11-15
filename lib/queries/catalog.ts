import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { certificates, courses, lessons, progress, users } from "@/db/schema";
import type { CourseSummary } from "@/types";

/** Course cards for the catalog. When `userId` is given, each card carries that student's progress. */
export async function getCatalog(userId?: string): Promise<CourseSummary[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: courses.id,
      slug: courses.slug,
      title: courses.title,
      description: courses.description,
      instructorId: courses.instructorId,
      thumbnail: courses.thumbnail,
      level: courses.level,
      instructorName: users.name,
      lessonCount: sql<number>`count(${lessons.id})::int`,
      totalDurationSec: sql<number>`coalesce(sum(${lessons.durationSec}), 0)::int`,
    })
    .from(courses)
    .innerJoin(users, eq(users.id, courses.instructorId))
    .leftJoin(lessons, eq(lessons.courseId, courses.id))
    .groupBy(courses.id, users.name)
    .orderBy(asc(courses.createdAt), asc(courses.title));

  if (!userId || rows.length === 0) return rows;

  const courseIds = rows.map((r) => r.id);
  const [doneRows, certRows] = await Promise.all([
    db
      .select({ courseId: lessons.courseId, done: sql<number>`count(*)::int` })
      .from(progress)
      .innerJoin(lessons, eq(lessons.id, progress.lessonId))
      .where(and(eq(progress.userId, userId), eq(progress.completed, true), inArray(lessons.courseId, courseIds)))
      .groupBy(lessons.courseId),
    db
      .select({ courseId: certificates.courseId })
      .from(certificates)
      .where(and(eq(certificates.userId, userId), inArray(certificates.courseId, courseIds))),
  ]);

  const done = new Map(doneRows.map((r) => [r.courseId, r.done]));
  const certified = new Set(certRows.map((r) => r.courseId));
  return rows.map((r) => ({ ...r, completedLessons: done.get(r.id) ?? 0, hasCertificate: certified.has(r.id) }));
}

export async function getCourseIdBySlug(slug: string): Promise<string | null> {
  const [row] = await getDb().select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1);
  return row?.id ?? null;
}
