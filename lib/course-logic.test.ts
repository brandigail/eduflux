import { describe, expect, it } from "vitest";
import { gradeQuiz } from "./grading";
import {
  canIssueCertificate,
  courseStatus,
  formatDuration,
  isLessonComplete,
  resumePosition,
} from "./course-logic";

const questions = [
  { id: "a", answerIndex: 1, explanation: "x" },
  { id: "b", answerIndex: 0, explanation: "y" },
  { id: "c", answerIndex: 2, explanation: "z" },
  { id: "d", answerIndex: 3, explanation: "w" },
];

describe("gradeQuiz", () => {
  it("scores all correct as 100 and passes", () => {
    const out = gradeQuiz(questions, [1, 0, 2, 3], 70);
    expect(out.score).toBe(100);
    expect(out.passed).toBe(true);
    expect(out.results.every((r) => r.correct)).toBe(true);
  });

  it("rounds the percentage and applies the pass mark", () => {
    const out = gradeQuiz(questions, [1, 0, 0, 0], 75); // 2 of 4 = 50
    expect(out.score).toBe(50);
    expect(out.passed).toBe(false);
  });

  it("treats null, missing and out-of-range answers as wrong", () => {
    const out = gradeQuiz(questions, [null, 9], 70);
    expect(out.score).toBe(0);
    expect(out.results.map((r) => r.correct)).toEqual([false, false, false, false]);
  });

  it("passes exactly at the pass mark", () => {
    const out = gradeQuiz(questions, [1, 0, 2, 0], 75);
    expect(out.score).toBe(75);
    expect(out.passed).toBe(true);
  });

  it("never passes an empty quiz", () => {
    expect(gradeQuiz([], [], 0).score).toBe(0);
  });
});

describe("lesson and course logic", () => {
  it("completes a lesson at 90% watched", () => {
    expect(isLessonComplete(9, 10)).toBe(true);
    expect(isLessonComplete(8, 9)).toBe(false); // 8.1s is the threshold for a 9s clip
    expect(isLessonComplete(9, 9)).toBe(true);
    expect(isLessonComplete(0, 0)).toBe(false);
  });

  it("resumes mid-lesson but restarts near the very start or end", () => {
    expect(resumePosition(4, 9)).toBe(4);
    expect(resumePosition(0.5, 9)).toBe(0);
    expect(resumePosition(8.5, 9)).toBe(0);
  });

  it("computes course status", () => {
    expect(courseStatus(3, 1)).toEqual({ lessonsDone: 1, lessonCount: 3, percent: 33, allLessonsDone: false });
    expect(courseStatus(3, 5).allLessonsDone).toBe(true);
    expect(courseStatus(0, 0).percent).toBe(0);
  });

  it("requires every lesson and a passed quiz for a certificate", () => {
    expect(canIssueCertificate(courseStatus(2, 2), true)).toBe(true);
    expect(canIssueCertificate(courseStatus(2, 2), false)).toBe(false);
    expect(canIssueCertificate(courseStatus(2, 1), true)).toBe(false);
  });

  it("formats durations as m:ss", () => {
    expect(formatDuration(9)).toBe("0:09");
    expect(formatDuration(125)).toBe("2:05");
    expect(formatDuration(-3)).toBe("0:00");
  });
});
