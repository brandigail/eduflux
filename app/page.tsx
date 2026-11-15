import { Award, PlayCircle, Zap } from "lucide-react";
import Link from "next/link";
import { CourseCard } from "@/components/CourseCard";
import { SiteHeader } from "@/components/SiteHeader";
import { getCatalog } from "@/lib/queries/catalog";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const highlights = [
  { icon: PlayCircle, title: "Video lessons", text: "Chapters, speed controls and resume where you left off." },
  { icon: Zap, title: "Instant quizzes", text: "Graded on the server with an explanation for every answer." },
  { icon: Award, title: "Certificates", text: "Finish a course, pass the quiz, download your PDF." },
];

export default async function HomePage() {
  const user = await getSessionUser();
  const courses = await getCatalog(user?.role === "STUDENT" ? user.id : undefined);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <h1 className="max-w-2xl text-3xl font-bold leading-tight sm:text-5xl">
              Learn by doing, track every step.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted">
              Short video courses with quizzes and certificates. Sign in as the demo student to see progress
              saved across lessons.
            </p>
            {!user && (
              <Link
                href="/login"
                className="mt-6 inline-flex h-12 items-center rounded-lg bg-accent px-6 font-semibold text-white hover:bg-accent-strong dark:text-[#0d1020]"
              >
                Try the demo
              </Link>
            )}
            <ul className="mt-10 grid gap-4 sm:grid-cols-3">
              {highlights.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" aria-hidden />
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="catalog" className="mx-auto max-w-6xl px-4 py-10">
          <h2 id="catalog" className="text-2xl font-bold">
            {user?.role === "STUDENT" ? "Your courses" : "Course catalog"}
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <li key={course.id} className="relative">
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
