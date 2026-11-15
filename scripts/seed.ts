import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import {
  certificates,
  courses,
  lessons,
  progress,
  quizAttempts,
  quizQuestions,
  quizzes,
  users,
} from "../db/schema";
import {
  CLIP_SECONDS,
  DEMO_COURSES,
  DEMO_EXTRA_STUDENTS,
  DEMO_INSTRUCTOR_EMAIL,
  DEMO_PASSWORD,
  DEMO_STUDENT_EMAIL,
} from "../db/demo-data";

/** Wipes and reseeds the demo content. Safe to run repeatedly. */
async function main(): Promise<void> {
  const db = getDb();
  await db.execute(
    sql`truncate table certificates, bookmarks, progress, quiz_attempts, quiz_questions, quizzes, lessons, courses, users restart identity cascade`,
  );

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [instructor] = await db
    .insert(users)
    .values({ name: "Dr. Naledi Khumalo", email: DEMO_INSTRUCTOR_EMAIL, passwordHash, role: "INSTRUCTOR" })
    .returning();

  const [sam] = await db
    .insert(users)
    .values({ name: "Sam Rivera", email: DEMO_STUDENT_EMAIL, passwordHash, role: "STUDENT" })
    .returning();

  const extras = await db
    .insert(users)
    .values(DEMO_EXTRA_STUDENTS.map((s) => ({ name: s.name, email: s.email, passwordHash, role: "STUDENT" as const })))
    .returning();

  const lessonIdsByCourse = new Map<string, string[]>();
  const quizByCourse = new Map<string, { quizId: string; courseId: string; total: number }>();

  for (const course of DEMO_COURSES) {
    const [row] = await db
      .insert(courses)
      .values({
        slug: course.slug,
        title: course.title,
        description: course.description,
        level: course.level,
        thumbnail: course.thumbnail,
        instructorId: instructor.id,
      })
      .returning();

    const lessonRows = await db
      .insert(lessons)
      .values(
        course.lessons.map((l, i) => ({
          courseId: row.id,
          title: l.title,
          summary: l.summary,
          videoUrl: `/videos/${course.slug}-${i + 1}.webm`,
          durationSec: CLIP_SECONDS,
          position: i + 1,
          chapters: l.chapters,
        })),
      )
      .returning();
    lessonIdsByCourse.set(course.slug, lessonRows.sort((a, b) => a.position - b.position).map((l) => l.id));

    const [quiz] = await db.insert(quizzes).values({ courseId: row.id, passMark: course.passMark }).returning();
    await db.insert(quizQuestions).values(
      course.questions.map((q, i) => ({
        quizId: quiz.id,
        text: q.text,
        options: q.options,
        answerIndex: q.answerIndex,
        explanation: q.explanation,
        position: i + 1,
      })),
    );
    quizByCourse.set(course.slug, { quizId: quiz.id, courseId: row.id, total: course.questions.length });
  }

  // Sam, the demo student: first lesson done and the second one half watched, so "Continue" has somewhere to resume.
  const webLessons = lessonIdsByCourse.get("web-fundamentals") ?? [];
  await db.insert(progress).values([
    { userId: sam.id, lessonId: webLessons[0], positionSec: CLIP_SECONDS, completed: true },
    { userId: sam.id, lessonId: webLessons[1], positionSec: 4, completed: false },
  ]);

  // Everyone else: realistic completion, attempts and certificates for the instructor dashboard.
  const progressRows: (typeof progress.$inferInsert)[] = [];
  const attemptRows: (typeof quizAttempts.$inferInsert)[] = [];
  const certificateRows: (typeof certificates.$inferInsert)[] = [];

  DEMO_EXTRA_STUDENTS.forEach((student, idx) => {
    const userId = extras[idx].id;
    for (const [slug, done] of Object.entries(student.completed)) {
      const ids = lessonIdsByCourse.get(slug) ?? [];
      ids.forEach((lessonId, i) => {
        if (i < done) progressRows.push({ userId, lessonId, positionSec: CLIP_SECONDS, completed: true });
      });
      const quiz = quizByCourse.get(slug);
      const score = student.scores[slug];
      const course = DEMO_COURSES.find((c) => c.slug === slug);
      if (quiz && course && score !== undefined) {
        const passed = score >= course.passMark;
        attemptRows.push({ userId, quizId: quiz.quizId, score, passed, answers: [] });
        if (passed && done === ids.length) certificateRows.push({ userId, courseId: quiz.courseId });
      }
    }
  });

  if (progressRows.length) await db.insert(progress).values(progressRows);
  if (attemptRows.length) await db.insert(quizAttempts).values(attemptRows);
  if (certificateRows.length) await db.insert(certificates).values(certificateRows);

  console.log(
    `Seeded ${DEMO_COURSES.length} courses, ${extras.length + 2} users, ${progressRows.length + 2} progress rows, ${certificateRows.length} certificates.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
