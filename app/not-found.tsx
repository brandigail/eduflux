import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">That course or lesson doesn&apos;t exist.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-lg border border-border px-5 font-medium hover:bg-surface-muted">
          Back to courses
        </Link>
      </main>
    </>
  );
}
