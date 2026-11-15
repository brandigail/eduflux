import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { lessons, progress } from "@/db/schema";
import { badRequest, requireStudent } from "@/lib/api-auth";
import { ensureCertificate } from "@/lib/certificates";
import { isLessonComplete } from "@/lib/course-logic";
import { progressSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

/** Saves where a student is in a lesson. A lesson, once complete, stays complete. */
export async function POST(request: Request) {
  const guard = await requireStudent();
  if (guard.response) return guard.response;

  const parsed = progressSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid progress update.");
  const { lessonId, positionSec, completed } = parsed.data;

  const db = getDb();
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lesson) return Response.json({ error: "Lesson not found." }, { status: 404 });

  const position = Math.min(positionSec, lesson.durationSec);
  const done = completed === true || isLessonComplete(position, lesson.durationSec);

  await db
    .insert(progress)
    .values({ userId: guard.user.id, lessonId, positionSec: position, completed: done })
    .onConflictDoUpdate({
      target: [progress.userId, progress.lessonId],
      set: {
        positionSec: position,
        completed: sql`${progress.completed} or ${done}`,
        updatedAt: new Date(),
      },
    });

  const certified = done ? await ensureCertificate(guard.user.id, lesson.courseId) : false;
  return Response.json({ ok: true, completed: done, certified });
}
