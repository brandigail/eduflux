import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { bookmarks, lessons } from "@/db/schema";
import { badRequest, requireStudent } from "@/lib/api-auth";
import { bookmarkCreateSchema, bookmarkDeleteSchema } from "@/lib/schemas";

export const dynamic = "force-dynamic";

const MAX_BOOKMARKS_PER_LESSON = 25;

export async function POST(request: Request) {
  const guard = await requireStudent();
  if (guard.response) return guard.response;

  const parsed = bookmarkCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Give the bookmark a short label.");

  const db = getDb();
  const [lesson] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, parsed.data.lessonId)).limit(1);
  if (!lesson) return Response.json({ error: "Lesson not found." }, { status: 404 });

  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, guard.user.id), eq(bookmarks.lessonId, parsed.data.lessonId)));
  if (existing.length >= MAX_BOOKMARKS_PER_LESSON) return badRequest("That lesson has the maximum number of bookmarks.");

  const [row] = await db
    .insert(bookmarks)
    .values({ userId: guard.user.id, ...parsed.data })
    .returning({ id: bookmarks.id, lessonId: bookmarks.lessonId, atSec: bookmarks.atSec, label: bookmarks.label });
  return Response.json({ bookmark: row }, { status: 201 });
}

export async function DELETE(request: Request) {
  const guard = await requireStudent();
  if (guard.response) return guard.response;

  const parsed = bookmarkDeleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid bookmark.");

  // Scoped to the signed-in student, so one student can never delete another's bookmark.
  await getDb()
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, parsed.data.id), eq(bookmarks.userId, guard.user.id)));
  return Response.json({ ok: true });
}
