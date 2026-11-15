/** A lesson counts as watched once the viewer reaches this share of its length. */
export const COMPLETE_AT_RATIO = 0.9;

export function isLessonComplete(positionSec: number, durationSec: number): boolean {
  return durationSec > 0 && positionSec >= durationSec * COMPLETE_AT_RATIO;
}

/** Where to start playback: resume, but restart if the viewer had basically finished. */
export function resumePosition(positionSec: number, durationSec: number): number {
  if (positionSec <= 1) return 0;
  if (positionSec >= durationSec - 1) return 0;
  return positionSec;
}

export interface CourseStatus {
  lessonsDone: number;
  lessonCount: number;
  percent: number;
  allLessonsDone: boolean;
}

export function courseStatus(lessonCount: number, lessonsDone: number): CourseStatus {
  const done = Math.min(lessonsDone, lessonCount);
  return {
    lessonsDone: done,
    lessonCount,
    percent: lessonCount === 0 ? 0 : Math.round((done / lessonCount) * 100),
    allLessonsDone: lessonCount > 0 && done >= lessonCount,
  };
}

/** A certificate needs every lesson watched and a passing quiz result. */
export function canIssueCertificate(status: CourseStatus, hasPassedQuiz: boolean): boolean {
  return status.allLessonsDone && hasPassedQuiz;
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
