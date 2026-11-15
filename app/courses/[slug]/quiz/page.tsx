import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { QuizRunner } from "@/features/quiz/QuizRunner";
import { getCourseDetail, getQuizPublic } from "@/lib/queries/learning";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Course quiz" };

export default async function QuizPage({ params }: PageProps<"/courses/[slug]/quiz">) {
  const { slug } = await params;
  const user = await requireUser(`/courses/${slug}/quiz`);
  const detail = await getCourseDetail(slug);
  if (!detail) notFound();
  const quiz = await getQuizPublic(detail.course.id);
  if (!quiz) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <p className="text-sm text-muted">
          <Link href={`/courses/${slug}`} className="hover:underline">
            {detail.course.title}
          </Link>{" "}
          / Quiz
        </p>
        <h1 className="mt-1 text-2xl font-bold">Course quiz</h1>
        <p className="mt-1 text-muted">
          {quiz.questions.length} questions. You need {quiz.passMark}% to pass, and you can retake it as often as you like.
        </p>
        {user.role === "STUDENT" ? (
          <div className="mt-6">
            <QuizRunner quiz={quiz} courseSlug={slug} />
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-border bg-surface p-5 text-muted">
            Quizzes are for students. Sign in as the demo student to take it.
          </p>
        )}
      </main>
    </>
  );
}
