import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { signOutAction } from "@/features/auth/actions";
import { ThemeToggle } from "./ThemeToggle";

export async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-foreground">
          <GraduationCap className="h-6 w-6 text-accent" aria-hidden />
          EduFlux
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-muted hover:text-foreground">
            Courses
          </Link>
          {user?.role === "INSTRUCTOR" && (
            <Link
              href="/instructor"
              className="rounded-lg px-3 py-2 text-muted hover:bg-surface-muted hover:text-foreground"
            >
              Instructor
            </Link>
          )}
          <ThemeToggle />
          {user ? (
            <form action={signOutAction} className="flex items-center gap-2">
              <span className="hidden text-muted sm:inline">{user.name}</span>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-surface-muted"
              >
                Sign out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-accent-strong dark:text-[#0d1020]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
