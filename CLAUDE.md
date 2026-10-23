# EduFlux: LMS and Interactive Learning Portal

Read the portfolio-root `CLAUDE.md` first for global rules. This file is the brief for this project.

## What it is
A small LMS. Students watch course videos with chapters and progress tracking, take quizzes with instant feedback, and earn a PDF certificate. Instructors manage courses and see completion stats.

## Stack
Next.js (App Router), TypeScript strict, Tailwind CSS, Video.js, Drizzle with Neon Postgres, Auth.js (credentials), pdf-lib or @react-pdf/renderer for certificates, Recharts. Hosted on Netlify. No Supabase, no Vercel, no Gemini/OpenAI.

## MVP (build first)
1. Course catalog and player page: Video.js with speed controls, chapter list/bookmarks, and per-lesson progress saved to Neon.
2. Quiz engine: multiple choice, immediate feedback, pass mark, attempts stored.
3. Certificate: on course completion generate a PDF with student name, course and date, downloadable.

## Phase 2
Instructor dashboard (create course, upload materials, completion rates), Feedback/ratings per course, Resume where you left off across devices, Course search.

## Data model (put in `types/`)
```ts
export interface User { id: string; name: string; email: string; role: 'STUDENT' | 'INSTRUCTOR' }
export interface Course { id: string; title: string; description: string; instructorId: string; thumbnail: string }
export interface Lesson { id: string; courseId: string; title: string; videoUrl: string; durationSec: number; position: number; chapters: { at: number; title: string }[] }
export interface Quiz { id: string; courseId: string; passMark: number; questions: { id: string; text: string; options: string[]; answerIndex: number }[] }
export interface Progress { userId: string; lessonId: string; positionSec: number; completed: boolean }
export interface Certificate { id: string; userId: string; courseId: string; issuedAt: string }
```

## Rules specific to this project
- Videos: use small royalty-free clips stored under `/public/videos` (note licence in `TODO-ASSETS.md`); never hotlink. Keep repo size sensible (short, compressed clips).
- Validate quiz answers server-side; never ship `answerIndex` to the client before submission.
- Video.js only inside a client component, initialised in an effect.
- Seed 3 courses with lessons, quizzes and a demo student login.
- Seed realistic demo data so the app looks alive on first load without sign-up.

## Start here
1. Ask me for the Neon `DATABASE_URL`; generate `AUTH_SECRET`.
2. Scaffold Next.js + Tailwind + Drizzle, commit.
3. Work through `PLAN.md` from step 2.
