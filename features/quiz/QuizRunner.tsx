"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { QuizSubmitResponse } from "@/app/api/quiz/[courseId]/submit/route";
import type { QuizPublic } from "@/types";

interface QuizRunnerProps {
  quiz: QuizPublic;
  courseSlug: string;
}

export function QuizRunner({ quiz, courseSlug }: QuizRunnerProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [result, setResult] = useState<QuizSubmitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const answered = answers.filter((a) => a !== null).length;
  const complete = answered === quiz.questions.length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!complete) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/quiz/${quiz.courseId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const body: QuizSubmitResponse | { error: string } = await res.json();
      if (!res.ok || "error" in body) {
        setError("error" in body ? body.error : "Could not grade the quiz.");
        return;
      }
      setResult(body);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function retake() {
    setAnswers(quiz.questions.map(() => null));
    setResult(null);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {result && (
        <div
          role="status"
          className={`rounded-2xl border p-5 ${result.passed ? "border-success" : "border-danger"} bg-surface`}
        >
          <p className="text-2xl font-bold">
            {result.score}% <span className="text-base font-medium text-muted">(pass mark {result.passMark}%)</span>
          </p>
          <p className="mt-1">
            {result.passed ? "You passed." : "Not quite yet. Review the explanations and try again."} Attempt{" "}
            {result.attemptNumber}.
          </p>
          {result.certified && (
            <p className="mt-2 text-success">
              Certificate earned.{" "}
              <Link href={`/courses/${courseSlug}`} className="font-semibold underline">
                Open course page to download it
              </Link>
              .
            </p>
          )}
          {result.passed && !result.certified && (
            <p className="mt-2 text-muted">Watch every lesson to unlock your certificate.</p>
          )}
          <button
            type="button"
            onClick={retake}
            className="mt-4 h-11 rounded-lg border border-border px-5 font-medium hover:bg-surface-muted"
          >
            Retake quiz
          </button>
        </div>
      )}

      {quiz.questions.map((question, qi) => {
        const feedback = result?.results[qi];
        return (
          <fieldset key={question.id} className="rounded-2xl border border-border bg-surface p-5">
            <legend className="px-1 font-semibold">
              {qi + 1}. {question.text}
            </legend>
            <div className="mt-3 space-y-2">
              {question.options.map((option, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = feedback?.correctIndex === oi;
                const isWrongChoice = feedback && chosen && !feedback.correct;
                return (
                  <label
                    key={option}
                    className={`flex min-h-11 items-center gap-3 rounded-lg border px-3 py-2 text-sm ${
                      isCorrect
                        ? "border-success bg-surface-muted"
                        : isWrongChoice
                          ? "border-danger bg-surface-muted"
                          : chosen
                            ? "border-accent bg-accent-soft"
                            : "border-border hover:bg-surface-muted"
                    } ${result ? "" : "cursor-pointer"}`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={chosen}
                      disabled={Boolean(result)}
                      onChange={() => setAnswers((prev) => prev.map((a, i) => (i === qi ? oi : a)))}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span className="flex-1">{option}</span>
                    {isCorrect && <CheckCircle2 className="h-5 w-5 text-success" aria-label="Correct answer" />}
                    {isWrongChoice && <XCircle className="h-5 w-5 text-danger" aria-label="Your answer, incorrect" />}
                  </label>
                );
              })}
            </div>
            {feedback && <p className="mt-3 text-sm text-muted">{feedback.explanation}</p>}
          </fieldset>
        );
      })}

      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      {!result && (
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!complete || busy}
            className="h-12 rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 dark:text-[#0d1020]"
          >
            {busy ? "Grading…" : "Submit answers"}
          </button>
          <p className="text-sm text-muted">
            {answered} of {quiz.questions.length} answered
          </p>
        </div>
      )}
    </form>
  );
}
