import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { DEMO_INSTRUCTOR_EMAIL, DEMO_PASSWORD, DEMO_STUDENT_EMAIL } from "@/db/demo-data";
import { LoginForm } from "@/features/auth/LoginForm";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";
  if (await getSessionUser()) redirect(next);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-muted">
          This is a portfolio demo. The demo student is filled in for you, so just press Sign in.
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <LoginForm
            next={next}
            demoEmail={DEMO_STUDENT_EMAIL}
            demoPassword={DEMO_PASSWORD}
            instructorEmail={DEMO_INSTRUCTOR_EMAIL}
          />
        </div>
      </main>
    </>
  );
}
