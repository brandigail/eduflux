import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { certificates, lessons, progress, quizAttempts, quizzes } from "@/db/schema";
import { canIssueCertificate, courseStatus } from "@/lib/course-logic";

/**
 * Issues a certificate if the student has watched every lesson and passed the quiz.
 * Idempotent: a second call never creates a duplicate. Returns true if a certificate now exists.
 */
export async function ensureCertificate(userId: string, courseId: string): Promise<boolean> {
  const db = getDb();

  const [[lessonTotals], [passedRow]] = await Promise.all([
    db
      .select({
        total: sql<number>`count(${lessons.id})::int`,
        done: sql<number>`count(${progress.lessonId}) filter (where ${progress.completed})::int`,
      })
      .from(lessons)
      .leftJoin(progress, and(eq(progress.lessonId, lessons.id), eq(progress.userId, userId)))
      .where(eq(lessons.courseId, courseId)),
    db
      .select({ passed: sql<number>`count(*)::int` })
      .from(quizAttempts)
      .innerJoin(quizzes, eq(quizzes.id, quizAttempts.quizId))
      .where(and(eq(quizAttempts.userId, userId), eq(quizzes.courseId, courseId), eq(quizAttempts.passed, true))),
  ]);

  const status = courseStatus(lessonTotals?.total ?? 0, lessonTotals?.done ?? 0);
  if (!canIssueCertificate(status, (passedRow?.passed ?? 0) > 0)) {
    const [existing] = await db
      .select({ id: certificates.id })
      .from(certificates)
      .where(and(eq(certificates.userId, userId), eq(certificates.courseId, courseId)))
      .limit(1);
    return Boolean(existing);
  }

  await db.insert(certificates).values({ userId, courseId }).onConflictDoNothing();
  return true;
}
