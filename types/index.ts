export type Role = "STUDENT" | "INSTRUCTOR";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  instructorId: string;
  thumbnail: string;
  level: "Beginner" | "Intermediate";
}

export interface Chapter {
  at: number;
  title: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  videoUrl: string;
  durationSec: number;
  position: number;
  chapters: Chapter[];
}

/** What the client may see: the correct answer is never included. */
export interface QuizQuestionPublic {
  id: string;
  text: string;
  options: string[];
}

export interface QuizPublic {
  id: string;
  courseId: string;
  passMark: number;
  questions: QuizQuestionPublic[];
}

export interface QuestionResult {
  questionId: string;
  chosenIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation: string;
}

export interface QuizResult {
  score: number;
  passMark: number;
  passed: boolean;
  attemptNumber: number;
  results: QuestionResult[];
}

export interface Progress {
  userId: string;
  lessonId: string;
  positionSec: number;
  completed: boolean;
}

export interface Bookmark {
  id: string;
  lessonId: string;
  atSec: number;
  label: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issuedAt: string;
}

export interface CourseSummary extends Course {
  instructorName: string;
  lessonCount: number;
  totalDurationSec: number;
  /** Present when a student is signed in. */
  completedLessons?: number;
  hasCertificate?: boolean;
}

export interface CompletionStat {
  courseId: string;
  title: string;
  enrolled: number;
  completed: number;
  averageScore: number | null;
}
