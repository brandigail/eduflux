import type { QuestionResult } from "@/types";

export interface GradableQuestion {
  id: string;
  answerIndex: number;
  explanation: string;
}

export interface GradeOutcome {
  score: number;
  passed: boolean;
  results: QuestionResult[];
}

/**
 * Grades a submission on the server. Answers line up with questions by position;
 * missing, null or out-of-range answers count as wrong.
 */
export function gradeQuiz(
  questions: readonly GradableQuestion[],
  answers: readonly (number | null)[],
  passMark: number,
): GradeOutcome {
  const results: QuestionResult[] = questions.map((q, i) => {
    const chosen = answers[i] ?? null;
    return {
      questionId: q.id,
      chosenIndex: chosen,
      correctIndex: q.answerIndex,
      correct: chosen === q.answerIndex,
      explanation: q.explanation,
    };
  });
  const correctCount = results.filter((r) => r.correct).length;
  const score = questions.length === 0 ? 0 : Math.round((correctCount / questions.length) * 100);
  return { score, passed: score >= passMark, results };
}
