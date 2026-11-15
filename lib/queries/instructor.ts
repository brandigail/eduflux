import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { certificates, courses, lessons, progress, quizAttempts, quizzes, users } from "@/db/schema";
import type { CompletionStat } from "@/types";

export interface InstructorOverview {
  stats: CompletionStat[];
  totalStudents: number;
  totalCertificates: number;
}

/** Completion numbers per course: who started, who finished (certificate issued) and the average best score. */
export async function getInstructorOverview(): Promise<InstructorOverview> {
  const db = getDb();
  const courseRows = await db.select({ id: courses.id, title: courses.title }).from(courses).orderBy(asc(courses.createdAt));

  const [enrolledRows, certRows, scoreRows, studentRows] = await Promise.all([
    db
      .select({ courseId: lessons.courseId, n: sql<number>`count(distinct ${progress.userId})::int` })
      .from(progress)
      .innerJoin(lessons, eq(lessons.id, progress.lessonId))
      .groupBy(lessons.courseId),
    db
      .select({ courseId: certificates.courseId, n: sql<number>`count(*)::int` })
      .from(certificates)
      .groupBy(certificates.courseId),
    db
      .select({
        courseId: quizzes.courseId,
        avg: sql<number>`round(avg(best.score))::int`,
      })
      .from(quizzes)
      .innerJoin(
        sql`(select quiz_id, user_id, max(score) as score from ${quizAttempts} group by quiz_id, user_id) as best`,
        sql`best.quiz_id = ${quizzes.id}`,
      )
      .groupBy(quizzes.courseId),
    db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "STUDENT")),
  ]);

  const enrolled = new Map(enrolledRows.map((r) => [r.courseId, r.n]));
  const completed = new Map(certRows.map((r) => [r.courseId, r.n]));
  const average = new Map(scoreRows.map((r) => [r.courseId, r.avg]));

  const stats: CompletionStat[] = courseRows.map((c) => ({
    courseId: c.id,
    title: c.title,
    enrolled: enrolled.get(c.id) ?? 0,
    completed: completed.get(c.id) ?? 0,
    averageScore: average.get(c.id) ?? null,
  }));

  return {
    stats,
    totalStudents: studentRows[0]?.n ?? 0,
    totalCertificates: stats.reduce((sum, s) => sum + s.completed, 0),
  };
}
