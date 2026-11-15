"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-20 text-center">
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-muted">Try again. If it keeps happening, the database may be waking up.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 h-11 rounded-lg bg-accent px-5 font-semibold text-white hover:bg-accent-strong dark:text-[#0d1020]"
      >
        Try again
      </button>
    </main>
  );
}
