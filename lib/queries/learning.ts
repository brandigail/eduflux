import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  bookmarks,
  certificates,
  courses,
  lessons,
  progress,
  quizAttempts,
  quizQuestions,
  quizzes,
  users,
} from "@/db/schema";
import { courseStatus, type CourseStatus } from "@/lib/course-logic";
import type { Bookmark, Course, Lesson, QuizPublic } from "@/types";

export interface LessonWithProgress extends Lesson {
  positionSec: number;
  completed: boolean;
}

export interface AttemptSummary {
  id: string;
  score: number;
  passed: boolean;
  createdAt: Date;
}

export interface CourseDetail {
  course: Course & { instructorName: string };
  lessons: LessonWithProgress[];
  status: CourseStatus;
  quiz: { id: string; passMark: number; questionCount: number } | null;
  attempts: AttemptSummary[];
  hasPassed: boolean;
  certificate: { id: string; issuedAt: Date } | null;
}

export async function getCourseDetail(slug: string, userId?: string): Promise<CourseDetail | null> {
  const db = getDb();
  const [row] = await db
    .select({ course: courses, instructorName: users.name })
    .from(courses)
    .innerJoin(users, eq(users.id, courses.instructorId))
    .where(eq(courses.slug, slug))
    .limit(1);
  if (!row) return null;

  const lessonRows = await db.select().from(lessons).where(eq(lessons.courseId, row.course.id)).orderBy(asc(lessons.position));
  const lessonIds = lessonRows.map((l) => l.id);

  const [progressRows, quizRows] = await Promise.all([
    userId && lessonIds.length
      ? db.select().from(progress).where(and(eq(progress.userId, userId), inArray(progress.lessonId, lessonIds)))
      : Promise.resolve([]),
    db.select().from(quizzes).where(eq(quizzes.courseId, row.course.id)).limit(1),
  ]);
  const quiz = quizRows[0];

  const byLesson = new Map(progressRows.map((p) => [p.lessonId, p]));
  const withProgress: LessonWithProgress[] = lessonRows.map((l) => ({
    ...l,
    positionSec: byLesson.get(l.id)?.positionSec ?? 0,
    completed: byLesson.get(l.id)?.completed ?? false,
  }));

  let attempts: AttemptSummary[] = [];
  let questionCount = 0;
  let certificate: CourseDetail["certificate"] = null;
  if (quiz) {
    const [questionRows, attemptRows, certRows] = await Promise.all([
      db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id)),
      userId
        ? db
            .select({ id: quizAttempts.id, score: quizAttempts.score, passed: quizAttempts.passed, createdAt: quizAttempts.createdAt })
            .from(quizAttempts)
            .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quiz.id)))
            .orderBy(desc(quizAttempts.createdAt))
        : Promise.resolve([]),
      userId
        ? db
            .select({ id: certificates.id, issuedAt: certificates.issuedAt })
            .from(certificates)
            .where(and(eq(certificates.userId, userId), eq(certificates.courseId, row.course.id)))
            .limit(1)
        : Promise.resolve([]),
    ]);
    questionCount = questionRows.length;
    attempts = attemptRows;
    certificate = certRows[0] ?? null;
  }

  return {
    course: { ...row.course, instructorName: row.instructorName },
    lessons: withProgress,
    status: courseStatus(withProgress.length, withProgress.filter((l) => l.completed).length),
    quiz: quiz ? { id: quiz.id, passMark: quiz.passMark, questionCount } : null,
    attempts,
    hasPassed: attempts.some((a) => a.passed),
    certificate,
  };
}

export async function getLessonBookmarks(userId: string, lessonId: string): Promise<Bookmark[]> {
  const rows = await getDb()
    .select({ id: bookmarks.id, lessonId: bookmarks.lessonId, atSec: bookmarks.atSec, label: bookmarks.label })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.lessonId, lessonId)))
    .orderBy(asc(bookmarks.atSec));
  return rows;
}

/** The quiz as the client may see it: question text and options only, never the answers. */
export async function getQuizPublic(courseId: string): Promise<QuizPublic | null> {
  const db = getDb();
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).limit(1);
  if (!quiz) return null;
  const questions = await db
    .select({ id: quizQuestions.id, text: quizQuestions.text, options: quizQuestions.options })
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(asc(quizQuestions.position));
  return { id: quiz.id, courseId, passMark: quiz.passMark, questions };
}
