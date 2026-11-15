import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

export const progressSchema = z.object({
  lessonId: z.string().uuid(),
  positionSec: z.number().int().min(0).max(60 * 60 * 6),
  completed: z.boolean().optional(),
});

export const bookmarkCreateSchema = z.object({
  lessonId: z.string().uuid(),
  atSec: z.number().int().min(0).max(60 * 60 * 6),
  label: z.string().trim().min(1).max(80),
});

export const bookmarkDeleteSchema = z.object({ id: z.string().uuid() });

export const quizSubmitSchema = z.object({
  /** One entry per question, in question order; null means unanswered. */
  answers: z.array(z.number().int().min(0).max(9).nullable()).min(1).max(50),
});
