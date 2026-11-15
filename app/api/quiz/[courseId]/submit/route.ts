import { and, asc, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { quizAttempts, quizQuestions, quizzes } from "@/db/schema";
import { badRequest, requireStudent } from "@/lib/api-auth";
import { ensureCertificate } from "@/lib/certificates";
import { gradeQuiz } from "@/lib/grading";
import { quizSubmitSchema } from "@/lib/schemas";
import type { QuizResult } from "@/types";

export const dynamic = "force-dynamic";

export interface QuizSubmitResponse extends QuizResult {
  certified: boolean;
}

/** Grades a quiz on the server. The answers never reach the browser until this returns. */
export async function POST(request: Request, ctx: RouteContext<"/api/quiz/[courseId]/submit">) {
  const guard = await requireStudent();
  if (guard.response) return guard.response;

  const { courseId } = await ctx.params;
  const parsed = quizSubmitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return badRequest("Invalid answers.");

  const db = getDb();
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).limit(1);
  if (!quiz) return Response.json({ error: "Quiz not found." }, { status: 404 });

  const questions = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.quizId, quiz.id))
    .orderBy(asc(quizQuestions.position));
  if (parsed.data.answers.length !== questions.length) return badRequest("Answer every question.");

  const outcome = gradeQuiz(questions, parsed.data.answers, quiz.passMark);
  await db.insert(quizAttempts).values({
    userId: guard.user.id,
    quizId: quiz.id,
    score: outcome.score,
    passed: outcome.passed,
    answers: parsed.data.answers,
  });

  const [{ attemptNumber }] = await db
    .select({ attemptNumber: count() })
    .from(quizAttempts)
    .where(and(eq(quizAttempts.userId, guard.user.id), eq(quizAttempts.quizId, quiz.id)));

  const certified = outcome.passed ? await ensureCertificate(guard.user.id, courseId) : false;

  const response: QuizSubmitResponse = {
    score: outcome.score,
    passMark: quiz.passMark,
    passed: outcome.passed,
    attemptNumber,
    results: outcome.results,
    certified,
  };
  return Response.json(response);
}
